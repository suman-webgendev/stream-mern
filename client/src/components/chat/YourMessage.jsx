const YourMessage = ({ message, type }) => {
  return (
    <div className="mt-1 flex flex-col items-start">
      {type === "image" ? (
        <img
          src={message}
          alt="Received"
          className="my-1 mr-[25%] max-w-[60%] rounded-[20px] bg-[#c9c4c4] px-4 py-2 text-black"
          style={{ maxHeight: "300px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "/failedImage.png";
          }}
        />
      ) : (
        <div className="my-1 mr-[25%] inline-block max-w-[60%] text-pretty break-words rounded-[20px] bg-[#c9c4c4] px-4 py-2 text-black">
          {message}
        </div>
      )}
    </div>
  );
};

export default YourMessage;
