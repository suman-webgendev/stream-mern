const YourMessage = ({ message }) => {
  return (
    <div className="mt-1 flex flex-col items-start">
      <div className="my-1 mr-[25%] inline-block max-w-[60%] text-pretty break-words rounded-[20px] bg-[#c9c4c4] px-4 py-2 text-black">
        {message}
      </div>
    </div>
  );
};

export default YourMessage;
