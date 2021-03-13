import React from "react";
import NextLink from "next/link";
import { Flex, Link, Heading, Text } from "@chakra-ui/react";
import { RegularPostFragment } from "../generated/graphql";
import { UpvoteSection } from "./UpvoteSection";
import { PostActions } from "./PostActions";

interface PostProps {
  post: RegularPostFragment;
}

export const Post: React.FC<PostProps> = ({ post }) => {
  const editedPost = post.editedAt && new Date(parseInt(post.editedAt));

  return (
    <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
      <UpvoteSection post={post} />
      <Flex flex={1} direction="column">
        <NextLink href="/post/[id]" as={`/post/${post.id}`}>
          <Link>
            <Heading fontSize="xl">{post.title}</Heading>
          </Link>
        </NextLink>
        <Flex>
          <Text>Posted by {post.creator.username}</Text>
          {editedPost && (
            <Text as="em" ml={2}>
              (Edited on {editedPost.toLocaleDateString()})
            </Text>
          )}
        </Flex>
        <Text mt={4}>{post.textSnippet}</Text>
      </Flex>
      <PostActions id={post.id} creatorId={post.creator.id} />
    </Flex>
  );
};
