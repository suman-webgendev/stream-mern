import { Avatar, Box, Text } from "@chakra-ui/react";

const UserListItem = ({ user, handleClick }) => {
  return (
    <Box
      onClick={handleClick}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={3}
      mb={2}
      borderRadius="lg"
    >
      <Avatar mr={2} size="sm" cursor="pointer" name={user?.name} />
      <Box>
        <Text>{user?.name}</Text>
        <Text fontSize="small">
          <b>Email: </b>
          {user?.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
