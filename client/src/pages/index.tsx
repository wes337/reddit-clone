import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { Button, Flex, Stack } from "@chakra-ui/react";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Post } from "../components/Post";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <>
        <div>Something went very wrong!</div>
        {error && <div>{error.message}</div>}
      </>
    );
  }

  return (
    <Layout>
      <Stack spacing={8}>
        {!data && fetching && <div>Loading...</div>}
        {data && data.posts?.items?.map((post) => post && <Post post={post} />)}
      </Stack>

      <Flex py={8}>
        {data?.posts?.hasMore && (
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor:
                  data?.posts?.items?.[data.posts.items.length - 1]?.createdAt,
              });
            }}
            isLoading={fetching}
            mx="auto"
          >
            Load more
          </Button>
        )}
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
