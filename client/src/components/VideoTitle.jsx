import { Avatar } from "@chakra-ui/react";

const VideoTitle = (props) => {
  return (
    <div className="m-2 mx-auto max-w-[80vw] p-3">
      <div className="flex items-center space-x-2">
        <Avatar name={props.owner} size="sm" />
        <p className="text-muted-foreground">{props.owner}</p>
      </div>
      <p className="mt-3 text-xl font-semibold">{props.title}</p>
    </div>
  );
};

export default VideoTitle;
