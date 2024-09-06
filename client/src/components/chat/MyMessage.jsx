const MyMessage = ({ message, type }) => {
  return (
    <div className="mt-1 flex flex-col items-end">
      {type === "image" ? (
        <img
          src={message}
          alt="Sent"
          className="my-1 ml-[25%] max-w-[60%] cursor-pointer rounded-[20px] bg-gradient-to-b from-[#00D0EA] to-[#0085D1] px-4 py-2 text-white"
          style={{ maxHeight: "300px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "/failedImage.png";
          }}
        />
      ) : (
        <div className="my-1 ml-[25%] inline-block max-w-[60%] text-pretty break-words rounded-[20px] bg-gradient-to-b from-[#00D0EA] from-0% to-[#0085D1] to-100% bg-fixed px-4 py-2 text-white">
          {message}
        </div>
      )}
    </div>
  );
};

export default MyMessage;
