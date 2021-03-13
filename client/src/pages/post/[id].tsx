import React from "react";
import { withUrqlClient } from "next-urql";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { useGetPostFromUrl } from "../../hooks/useGetPostFromUrl";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { Layout } from "../../components/Layout";
import { PostActions } from "../../components/PostActions";

const Post = ({}) => {
  const [{ data, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return <Layout>Loading...</Layout>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Heading>Sorry, we couldn't find that post.</Heading>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex>
        <Heading flex={1} mb={4}>
          {data?.post?.title}
        </Heading>
        <PostActions id={data.post.id} creatorId={data.post.creator.id} />
      </Flex>
      <Text>{data?.post?.text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
