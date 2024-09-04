import { CloseIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";

const UserBadgeItem = ({ user, handleClick }) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={14}
      backgroundColor="purple"
      color="white"
      cursor="pointer"
      onClick={handleClick}
    >
      {user.name}
      <CloseIcon pl={1} />
    </Box>
  );
};

export default UserBadgeItem;
