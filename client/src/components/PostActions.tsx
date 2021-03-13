import React from "react";
import NextLink from "next/link";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostActionsProps {
  id: number;
  creatorId: number;
}

export const PostActions: React.FC<PostActionsProps> = ({ id, creatorId }) => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton aria-label="Edit post" icon={<EditIcon />} mx={2} />
      </NextLink>
      <IconButton
        aria-label="Delete post"
        icon={<DeleteIcon />}
        onClick={() => deletePost({ id })}
        mx={2}
      />
    </>
  );
};
