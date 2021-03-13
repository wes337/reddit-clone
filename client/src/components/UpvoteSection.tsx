import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Text, Flex, IconButton } from "@chakra-ui/react";
import { RegularPostFragment, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
  post: RegularPostFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "upvote" | "downvote" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();

  return (
    <Flex direction="column" align="center" mr={4}>
      <IconButton
        aria-label="Upvote post"
        icon={<ChevronUpIcon />}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "upvote"}
        onClick={async () => {
          setLoadingState("upvote");
          await vote({
            value: 1,
            postId: post.id,
          });
          setLoadingState("not-loading");
        }}
      />
      <Text>{post.points}</Text>
      <IconButton
        aria-label="Downvote post"
        icon={<ChevronDownIcon />}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downvote"}
        onClick={async () => {
          setLoadingState("downvote");
          await vote({
            value: -1,
            postId: post.id,
          });
          setLoadingState("not-loading");
        }}
      />
    </Flex>
  );
};
