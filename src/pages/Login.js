import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { fireauth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { validateIndexedDBOpenable } from "@firebase/util";
import { useNavigate } from "react-router-dom";
import { Button, Form, Modal } from "react-bootstrap";
import phoneCode from "../Phonecode";

let token = "";
const Login = (props) => {
  const [noBox, setnoBox] = useState(true);

  const [mobaile, setmobaile] = useState({ code: "+91", phone: "" });
  const [err, seterr] = useState("");
  const [otpvalue, setotpvalue] = useState({
    n1: "",
    n2: "",
    n3: "",
    n4: "",
    n5: "",
    n6: "",
  });
  const [otperr, setotperr] = useState(false);
  const [modalview, setmodalview] = useState(false);
  const [capchashow, setcapchashow] = useState(false);
  const [capchaid, setcapchid] = useState(["capcha"]);

  const otpBox = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const novalidation = () => {
    const phone = `${mobaile.code} ${mobaile.phone}`;
    seterr("");
    window.recaptchaVerifier = new RecaptchaVerifier(
      "capchaCode",
      {
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          setnoBox(false);
          setcapchashow(false);
        },
      },
      fireauth
    );
    const AppVarifire = window.recaptchaVerifier;
    signInWithPhoneNumber(fireauth, phone, AppVarifire)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
      })
      .catch((err) => {
        console.log(err);
        setnoBox(true);
        seterr("Too many attempt on this number.");
      });
  };

  const otpchange = (e, a) => {
    if (e.target.value.length > 0) {
      const kkey = `n${a + 1}`;
      setotpvalue({ ...otpvalue, [kkey]: e.target.value });
      otpBox[a + 1] && otpBox[a + 1].current.focus();
    }
  };

  const otpkeydown = (e, a) => {
    if ((e.target.value == "" && e.key == "Backspace") || e.key == "Delete") {
      const kkey = `n${a}`;
      setotpvalue({ ...otpvalue, [kkey]: "" });
      a - 1 >= 0 && otpBox[a - 1].current.focus();
    } else if ((a == 5 && e.key == "Backspace") || e.key == "Delete") {
      const kkey = `n${a + 1}`;
      setotpvalue({ ...otpvalue, [kkey]: "" });
    }
  };

  const otpValidation = () => {
    const isotp = `${otpvalue.n1}${otpvalue.n2}${otpvalue.n3}${otpvalue.n4}${otpvalue.n5}${otpvalue.n6}`;

    let confirmationResult = window.confirmationResult;
    confirmationResult
      .confirm(isotp)
      .then(async (result) => {
        setmodalview(true);
        setotperr(false);
        setcapchashow(true);

        //logindetaile get
        try {
          await fetch(`${props.ApiDom}/RxRooster/users/login`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mobile_number: mobaile.phone,
              is_verify: true,
              country_code: mobaile.code,
              device_token: "jbiusigerihsizdxjdjsi999",
              device_type: "web",
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              if (data.data) {
                token = data.data.token;
                localStorage.setItem(
                  "RxroosterLogin",
                  JSON.stringify(data.data)
                );
              }
            });
        } catch (err) {
          console.log(err);
        }

        if (token != "") {
          // document details get
          fetch(`${props.ApiDom}/RxRooster/document/userDocumentList`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: "",
          })
            .then((response) => response.json())
            .then((doc) =>
              localStorage.setItem(
                "RxroosterDocument",
                JSON.stringify(doc.data)
              )
            );

          // userDetails get
          fetch(`${props.ApiDom}/RxRooster/users/getUserDetail`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: "",
          })
            .then((response) => response.json())
            .then((doc) =>
              localStorage.setItem(
                "RxroosterUserdetails",
                JSON.stringify(doc.data)
              )
            );
        }
      })
      .catch((err) => {
        console.log(err);
        setotperr(true);
      });
  };

  const mobaileNochange = (e) => {
    const re = new RegExp("^[0-9]+$");
    if (e.target.value == "" || e.target.value.match(re)) {
      setmobaile({ ...mobaile, phone: e.target.value });
    }
  };

  const navigate = useNavigate();

  const noboxFocas = useRef();

  useEffect(() => {
    if (modalview) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [modalview]);

  useEffect(() => {
    noboxFocas.current.focus();
  }, []);

  useEffect(() => {
    if (noBox == false) {
      otpBox[0].current.focus();
    }
  }, [noBox]);

  return (
    <>
      {noBox ? (
        <div className="container-fluid laptop-padding">
          <div className="row align-items-center">
            <div className="col-12 col-md-7 col-lg-6">
              <div className="login-screen ">
                <h2 className="text-center">
                  Welcome to <span className="text-primary">Rx</span>Rooster
                </h2>
                <p className="text-center">
                  Hey, enter your details to get a login <br /> to your account
                </p>

                <div className={capchashow ? "d-none" : "d-block"}>
                  <form
                    className="l_form"
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <label>Mobile Number</label>
                    <div className="form-group flex-wrap">
                      <div className="d-flex w-100">
                        <select
                          className="form-select rx-input"
                          defaultValue="+91"
                          onChange={(e) =>
                            setmobaile({ ...mobaile, code: e.target.value })
                          }
                        >
                          {phoneCode.map((e) => {
                            return (
                              <option
                                key={`dialCodeKey${e.code}`}
                                value={e.dial_code}
                              >{`${e.code} (${e.dial_code})`}</option>
                            );
                          })}
                        </select>
                        <input
                          type="text"
                          name="number"
                          placeholder="Enter Number"
                          className="rx-input"
                          value={mobaile.phone}
                          ref={noboxFocas}
                          maxLength="10"
                          onChange={mobaileNochange}
                          onKeyDown={(e) => {
                            if (e.key == "Enter") {
                              if (mobaile.phone != "") {
                                if (mobaile.phone.length == 10) {
                                  setcapchashow(true);
                                  novalidation();
                                } else {
                                  seterr("Plese enter Valid phone no.");
                                }
                              } else {
                                seterr("Plese enter phone no.");
                              }
                            }
                          }}
                        />
                      </div>
                      {err != "" && <p className="err">{err}</p>}
                    </div>
                  </form>
                  <div className="text-center mt-90">
                    <button
                      className="login-btn text-center"
                      onClick={() => {
                        if (mobaile.phone != "") {
                          if (mobaile.phone.length == 10) {
                            setcapchashow(true);
                            novalidation();
                          } else {
                            seterr("Plese enter Valid phone no.");
                          }
                        } else {
                          seterr("Plese enter phone no.");
                        }
                      }}
                    >
                      Login
                    </button>
                  </div>
                </div>
                {capchaid.map((e) => (
                  <div
                    id="capchaCode"
                    className={capchashow ? "d-block" : "d-none"}
                  ></div>
                ))}
              </div>
            </div>
            <div className="col-12 col-md-5 col-lg-6 text-center">
              <img
                src="assets/images/login-logo.png"
                className="img-fluid"
                alt="rxrooster"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="container-fluid laptop-padding">
          <div className="row align-items-center">
            <div className="col-12 col-md-7 col-lg-6">
              <div className="login-screen ">
                <h2 className="text-center">
                  <span className="text-primary">Rx</span>Rooster
                </h2>
                <p className="text-center">
                  Code is Sent to {mobaile.code} ********
                  {mobaile.phone.slice(mobaile.phone.length - 2, 10)}
                </p>

                <form className="l_form" onSubmit={otpValidation}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="rx-input otp-input"
                      maxLength="1"
                      value={otpvalue.n1}
                      ref={otpBox[0]}
                      onChange={(e) => otpchange(e, 0)}
                      onKeyUp={(e) => otpkeydown(e, 0)}
                    />
                    <input
                      type="text"
                      className="rx-input otp-input"
                      maxLength="1"
                      value={otpvalue.n2}
                      ref={otpBox[1]}
                      onChange={(e) => otpchange(e, 1)}
                      onKeyUp={(e) => otpkeydown(e, 1)}
                    />
                    <input
                      type="text"
                      className="rx-input otp-input"
                      maxLength="1"
                      value={otpvalue.n3}
                      ref={otpBox[2]}
                      onChange={(e) => otpchange(e, 2)}
                      onKeyUp={(e) => otpkeydown(e, 2)}
                    />
                    <input
                      type="text"
                      className="rx-input otp-input"
                      maxLength="1"
                      value={otpvalue.n4}
                      ref={otpBox[3]}
                      onChange={(e) => otpchange(e, 3)}
                      onKeyUp={(e) => otpkeydown(e, 3)}
                    />
                    <input
                      type="text"
                      className="rx-input otp-input"
                      maxLength="1"
                      value={otpvalue.n5}
                      ref={otpBox[4]}
                      onChange={(e) => otpchange(e, 4)}
                      onKeyUp={(e) => otpkeydown(e, 4)}
                    />
                    <input
                      type="text"
                      className="rx-input otp-input"
                      maxLength="1"
                      value={otpvalue.n6}
                      ref={otpBox[5]}
                      onChange={(e) => otpchange(e, 5)}
                      onKeyUp={(e) => otpkeydown(e, 5)}
                    />
                  </div>
                  {otperr && (
                    <>
                      <p className="err" style={{ marginLeft: "0px" }}>
                        Plese enter Valid OTP
                      </p>
                    </>
                  )}
                </form>
                <div className="text-center mt-90">
                  <button
                    className="login-btn text-center"
                    type="submit"
                    onClick={otpValidation}
                  >
                    Verify
                  </button>

                  <label className="ntc">
                    Didn’t recieve code?{" "}
                    <span
                      onClick={() => {
                        setcapchid(["capcha"]);
                        setotpvalue({
                          n1: "",
                          n2: "",
                          n3: "",
                          n4: "",
                          n5: "",
                          n6: "",
                        });
                        setnoBox(true);
                      }}
                    >
                      Request again
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-5 col-lg-6 text-center">
              <img
                src="assets/images/login-logo.png"
                className="img-fluid"
                alt="rxrooster"
              />
            </div>
          </div>
        </div>
      )}
      <Modal
        show={modalview}
        className="modal-dialog-centered modal-dialog-zoom"
        centered
      >
        <Modal.Body className="text-center">
          <img
            src="assets/images/msg.png"
            className="img-fluid mt-2 mb-4"
            alt="rxrooster"
          />
          <h5 className="mb-0">
            Thank you for logging in. You can now upload documents
          </h5>
        </Modal.Body>
      </Modal>
      {/* <div className="modal fade" id="msg_Modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-dialog-zoom ">
        <div className="modal-content login_modal mx-6">
          <div className="modal-body text-center">
            <img src="assets/images/msg.png" className="img-fluid mt-2 mb-4"/>
            <h5 className="mb-0">Thank you for logging in. You can now upload documents</h5>
          </div>
        </div>
      </div>
    </div> */}
    </>
  );
};

export default Login;
