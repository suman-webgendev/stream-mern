import { cn } from "@/lib/utils";
import "@/styles/creditCard.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CreditCard = () => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [focusElementStyle, setFocusElementStyle] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const minCardYear = useMemo(() => new Date().getFullYear(), []);
  const currentCardBackground = useMemo(
    () => Math.floor(Math.random() * 25 + 1),
    [],
  );
  const amexCardMask = "#### ###### #####";
  const otherCardMask = "#### #### #### ####";

  const cardNumberRef = useRef(null);
  const cardNameRef = useRef(null);
  const cardDateRef = useRef(null);

  useEffect(() => {
    cardNumberRef.current.focus();
  }, []);

  const getCardType = useCallback(() => {
    let number = cardNumber;
    let re;
    re = new RegExp("^4");
    if (number.match(re) != null) return "visa";
    re = new RegExp("^(34|37)");
    if (number.match(re) != null) return "amex";
    re = new RegExp("^5[1-5]");
    if (number.match(re) != null) return "mastercard";
    re = new RegExp("^6011");
    if (number.match(re) != null) return "discover";
    re = new RegExp("^9792");
    if (number.match(re) != null) return "troy";
    re = new RegExp("^(36|38|39)");
    if (number.match(re) != null) return "dinersclub";
    re = new RegExp("^(35)");
    if (number.match(re) != null) return "jcb";
    re = new RegExp("^(62)");
    if (number.match(re) != null) return "unionpay";
    return "visa";
  }, [cardNumber]);

  const generateCardNumberMask = useCallback(() => {
    return getCardType() === "amex" ? amexCardMask : otherCardMask;
  }, [getCardType]);

  const minCardMonth = useCallback(() => {
    if (cardYear === minCardYear.toString()) return new Date().getMonth() + 1;
    return 1;
  }, [cardYear, minCardYear]);

  useEffect(() => {
    if (cardMonth < minCardMonth()) {
      setCardMonth("");
    }
  }, [cardMonth, minCardMonth]);

  const flipCard = (status) => {
    setIsCardFlipped(status);
  };

  const focusInput = useCallback((e) => {
    setIsInputFocused(true);
    let targetRef = e.target.dataset.ref;
    let target;
    if (targetRef === "cardNumber") target = cardNumberRef.current;
    if (targetRef === "cardName") target = cardNameRef.current;
    if (targetRef === "cardDate") target = cardDateRef.current;

    setFocusElementStyle({
      width: `${target.offsetWidth}px`,
      height: `${target.offsetHeight}px`,
      transform: `translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`,
    });
  }, []);

  const blurInput = () => {
    setTimeout(() => {
      if (!isInputFocused) {
        setFocusElementStyle(null);
      }
    }, 300);
    setIsInputFocused(false);
  };

  const maskCardNumber = useCallback(
    (value) => {
      const mask = generateCardNumberMask();
      let maskedValue = "";
      let index = 0;

      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === "#") {
          if (value[index]) {
            maskedValue += value[index];
            index++;
          } else {
            break;
          }
        } else {
          if (value[index]) {
            maskedValue += mask[i];
          } else {
            break;
          }
        }
      }

      return maskedValue;
    },
    [generateCardNumberMask],
  );

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const maskedValue = maskCardNumber(value);
    setCardNumber(maskedValue);
  };

  return (
    <div className="wrapper">
      <div className="card-form">
        <div className="card-list">
          <div className={cn("card-item", isCardFlipped && "-active")}>
            <div className="card-item__side -front">
              <div
                className={cn(
                  "card-item__focus",
                  focusElementStyle && "-active",
                )}
                style={focusElementStyle}
              ></div>
              <div className="card-item__cover">
                <img
                  src={`/cardBackgrounds/${currentCardBackground}.webp`}
                  className="card-item__bg"
                />
              </div>

              <div className="card-item__wrapper">
                <div className="card-item__top">
                  <img src="/chip.png" className="card-item__chip" />
                  <div className="card-item__type">
                    <img
                      src={`/cards/${getCardType()}.png`}
                      alt=""
                      className="card-item__typeImg"
                    />
                  </div>
                </div>
                <label
                  htmlFor="cardNumber"
                  className="card-item__number"
                  ref={cardNumberRef}
                >
                  {cardNumber.split("").map((n, index) => (
                    <div
                      key={index}
                      className={cn(
                        "card-item__numberItem",
                        n.trim() === "" && "-active",
                      )}
                    >
                      {index > 4 &&
                      index < 15 &&
                      cardNumber.length > index &&
                      n.trim() !== ""
                        ? "*"
                        : n}
                    </div>
                  ))}
                </label>
                <div className="card-item__content">
                  <label
                    htmlFor="cardName"
                    className="card-item__info"
                    ref={cardNameRef}
                  >
                    <div className="card-item__holder">Card Holder</div>
                    <div className="card-item__name">
                      {cardName.length
                        ? cardName
                            .replace(/\s\s+/g, " ")
                            .split("")
                            .map((n, index) => (
                              <span key={index} className="card-item__nameItem">
                                {n}
                              </span>
                            ))
                        : "Full Name"}
                    </div>
                  </label>
                  <div className="card-item__date" ref={cardDateRef}>
                    <label htmlFor="cardMonth" className="card-item__dateTitle">
                      Expires
                    </label>
                    <label htmlFor="cardMonth" className="card-item__dateItem">
                      <span>{cardMonth || "MM"}</span>
                    </label>
                    /
                    <label htmlFor="cardYear" className="card-item__dateItem">
                      <span>
                        {cardYear ? String(cardYear).slice(2, 4) : "YY"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-item__side -back">
              <div className="card-item__cover">
                <img
                  src={`/cardBackgrounds/${currentCardBackground}.webp`}
                  className="card-item__bg"
                />
              </div>
              <div className="card-item__band"></div>
              <div className="card-item__cvv">
                <div className="card-item__cvvTitle">CVV</div>
                <div className="card-item__cvvBand">
                  {cardCvv.split("").map((n, index) => (
                    <span key={index}>*</span>
                  ))}
                </div>
                <div className="card-item__type">
                  <img
                    src={`/cards/${getCardType()}.png`}
                    className="card-item__typeImg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-form__inner">
          <div className="card-input">
            <label htmlFor="cardNumber" className="card-input__label">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              className="card-input__input"
              value={cardNumber}
              onChange={handleCardNumberChange}
              onFocus={focusInput}
              onBlur={blurInput}
              data-ref="cardNumber"
              autoComplete="off"
              maxLength={19}
            />
          </div>
          <div className="card-input">
            <label htmlFor="cardName" className="card-input__label">
              Card Holders
            </label>
            <input
              type="text"
              id="cardName"
              className="card-input__input"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onFocus={focusInput}
              onBlur={blurInput}
              data-ref="cardName"
              autoComplete="off"
            />
          </div>
          <div className="card-form__row">
            <div className="card-form__col">
              <div className="card-form__group">
                <label htmlFor="cardMonth" className="card-input__label">
                  Expiration Date
                </label>
                <select
                  className="card-input__input -select"
                  id="cardMonth"
                  value={cardMonth}
                  onChange={(e) => setCardMonth(e.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  data-ref="cardDate"
                >
                  <option value="" disabled>
                    Month
                  </option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option
                      key={n}
                      value={n < 10 ? `0${n}` : n}
                      disabled={n < minCardMonth()}
                    >
                      {n < 10 ? `0${n}` : n}
                    </option>
                  ))}
                </select>
                <select
                  className="card-input__input -select"
                  id="cardYear"
                  value={cardYear}
                  onChange={(e) => setCardYear(e.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  data-ref="cardDate"
                >
                  <option value="" disabled>
                    Year
                  </option>
                  {Array.from({ length: 12 }, (_, i) => i + minCardYear).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <div className="card-form__col -cvv">
              <div className="card-input">
                <label htmlFor="cardCvv" className="card-input__label">
                  CVV
                </label>
                <input
                  type="text"
                  className="card-input__input"
                  id="cardCvv"
                  maxLength="4"
                  value={cardCvv}
                  onChange={(e) =>
                    setCardCvv(e.target.value.replace(/\D/g, ""))
                  }
                  onFocus={() => flipCard(true)}
                  onBlur={() => flipCard(false)}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <button className="card-form__button">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
