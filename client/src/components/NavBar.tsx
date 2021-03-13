import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  let body;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <Flex>
        <NextLink href="/login">
          <Link mx={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mx={2}>Register</Link>
        </NextLink>
      </Flex>
    );
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button mx={2} as={Link}>
            Create post
          </Button>
        </NextLink>
        <Box mx={2} alignSelf="center">
          {data.me.username}
        </Box>
        <Button
          mx={2}
          variant="link"
          isLoading={logoutFetching}
          onClick={async () => {
            await logout();
            router.reload();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex position="sticky" zIndex={1} top={0} p={4} bg="wheat" align="center">
      <Flex flex={1} maxW={800} align="center" m="auto">
        <NextLink href="/">
          <Link>
            <Heading size="md">Reddit Clone</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};
