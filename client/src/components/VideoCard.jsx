import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const VideoCard = (props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/video-details", {
      state: {
        videoId: props.videoId,
        title: props.videoTitle,
        owner: props.owner,
      },
    });
  };

  return (
    <Card onClick={handleClick} className="cursor-pointer">
      <CardContent className="grid grid-cols-video content-center gap-1 self-center border-none p-1">
        <div className="my-auto h-48 w-64">
          <img
            src={props.imageUrl}
            alt="video thumbnail"
            width={256}
            height={128}
            loading="lazy"
            className="aspect-video size-full rounded-md object-cover object-center"
            onError={(e) => {
              e.target.src = "/public/noimage.webp";
              e.onerror = null;
            }}
          />
        </div>

        <div className="overflow-x grid h-32 w-full max-w-screen-md grid-rows-3 space-y-3">
          <p className="row-span-2 text-pretty text-lg">{props.videoTitle}</p>

          <div className="flex items-center space-x-1">
            <Avatar name={props.owner} size="sm" />
            <p>{props.owner}</p>
          </div>
          <p className="row-span-1 text-muted-foreground">
            {formatDate(props.uploadedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
