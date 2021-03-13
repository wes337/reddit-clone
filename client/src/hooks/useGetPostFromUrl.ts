import { usePostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
  const postIntId = useGetIntId();

  return usePostQuery({
    pause: postIntId === -1,
    variables: {
      id: postIntId,
    },
  });
};
