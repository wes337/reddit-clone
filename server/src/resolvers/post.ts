import { getConnection } from "typeorm";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Upvote } from "../entities/Upvote";
import { MyContext } from "../types";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  items: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.length < 250 ? root.text : `${root.text.slice(0, 250)}...`;
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, upvoteLoader }: MyContext
  ) {
    const userId = req.session.userId;
    if (!userId) {
      return null;
    }

    const upvote = await upvoteLoader.load({ postId: post.id, userId });
    return upvote ? upvote.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit) + 1;
    const replacements: any[] = [realLimit];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select p.*
      from post p
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    const hasMore = posts.length === realLimit;

    return { items: posts.slice(0, realLimit), hasMore };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text, editedAt: new Date().toUTCString() })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpvote = value !== -1;
    const upvoteValue = isUpvote ? 1 : -1;
    const { userId } = req.session;
    const existingUpvote = await Upvote.findOne({ where: { postId, userId } });

    if (existingUpvote && existingUpvote.value !== upvoteValue) {
      await getConnection().transaction(async (transactionManager) => {
        await transactionManager.query(
          `
        update upvote
        set value = $1
        where "postId" = $2 and "userId" = $3
        `,
          [upvoteValue, postId, userId]
        );

        await transactionManager.query(
          `
        update post
        set points = points + $1
        where id = $2;
        `,
          [2 * upvoteValue, postId]
        );
      });
    } else if (!existingUpvote) {
      await getConnection().transaction(async (transactionManager) => {
        await transactionManager.query(
          `
        insert into upvote ("userId", "postId", value)
        values ($1, $2, $3);
        `,
          [userId, postId, upvoteValue]
        );

        await transactionManager.query(
          `
        update post
        set points = points + $1
        where id = $2;
        `,
          [upvoteValue, postId]
        );
      });
    }

    return true;
  }
}
