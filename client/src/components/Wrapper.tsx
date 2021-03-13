import React from "react";
import { Box } from "@chakra-ui/react";

export type WrapperVariant = "small" | "regyular";

interface WrapperProps {
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box mt={4} mx="auto" maxW={variant === "regular" ? 800 : 400} w="100%">
      {children}
    </Box>
  );
};
