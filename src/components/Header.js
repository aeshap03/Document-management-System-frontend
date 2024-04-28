import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { fireauth } from "../firebase";

const Header = (props) => {
  const loginDeteiles = JSON.parse(localStorage.getItem("RxroosterLogin"));
  const userdetails =
    JSON.parse(localStorage.getItem("RxroosterUserdetails")) != undefined
      ? JSON.parse(localStorage.getItem("RxroosterUserdetails"))
      : "";
  const [updeteprofile , setupdeteprofile] = useState(false);

  const [professionlist, setprofessionlist] = useState([]);
  const inputref = useRef();
  const [userdata, setuserdata] = useState(userdetails ? userdetails : "");
  let validate = false;
  loginDeteiles && (validate = loginDeteiles.is_verify);

  const [formchange, setformchange] = useState({
    name: "",
    profession: "",
    image: "",
  });

  const [formerr, setformerr] = useState({
    name: "",
    profession: "",
  });

  const [images, setimages] = useState("");

  const [notificationCount, setnotificationCount] = useState(0);

  const [notification, setnotification] = useState([]);

  const [logoutmodal, setlogoutmodal] = useState(false);

  const [tost, settost] = useState({ status: false, message: "", succesful: false })

  useEffect(() => {
    if (validate) {
      const getprofessionlist = () => {
        fetch(
          `${props.ApiDom}/RxRooster/users/ProfessionList`,
          {
            method: "POST",
            body: "",
          }
        )
          .then((response) => response.json())
          .then((data) => {
            setprofessionlist(data.data);
          });
      };
      getprofessionlist();


      const getnotificationcount = () => {
        fetch(
          `${props.ApiDom}/RxRooster/users/notificationCount`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${loginDeteiles.token}`,
            },
            body: "",
          }
        )
          .then((response) => response.json())
          .then((data) => {
            setnotificationCount(data.data.notification_badge);
          });
      };
      getnotificationcount();

      const getuserdata = () => {
        try {
          fetch(`${props.ApiDom}/RxRooster/users/getUserDetail`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${loginDeteiles.token}`,
            },
            body: "",
          })
            .then((response) => response.json())
            .then((data) => {
              if (userdata != data.data) {
                localStorage.setItem(
                  "RxroosterUserdetails",
                  JSON.stringify(data.data)
                );
                setuserdata(data.data);
              }
            });
        } catch (err) {
          console.log(err);
        }
      };
      getuserdata();
    }
  }, []);

  useEffect(() => {
    if (tost.status) {
      setTimeout(() => {
        settost({ status: false, message: "", succesful: false });
      }, 2000);
    }
  }, [tost])

  const getnotification = () => {
    fetch(
      `${props.ApiDom}/RxRooster/users/notificationList`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loginDeteiles.token}`,
        },
        body: "",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setnotification(data.data);
      });
  }

  const changeform = (e) => {
    const { name, value } = e.target;
    setformchange((pre) => {
      if (name == "image") {
        const url = Array.from(e.target.files);
        const photo = url.map((a) => {
          return window.URL.createObjectURL(a);
        });
        setimages(photo);

        return {
          ...pre,
          [name]: e.target.files[0],
        };
      } else if(name == "name"){
        const re =/^[A-Za-z\s]*$/;
        console.log(re.test(value));
        if (value === "" || re.test(value)) {
          return { ...pre, [name]: value };
        }else{
          return { ...pre}
        }
      }else {
        return { ...pre, [name]: value };
      }
    });
  };

  const submitedform = (e) => {
    e.preventDefault();

    let error = false;

    let errdata = formerr;


    if (formchange.name === "") {
      errdata = {
        ...errdata,
        name: "Please enter your name",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        name: "",
      };
    }

    if (formchange.profession === "") {
      errdata = {
        ...errdata,
        profession: "Please select Profession",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        profession: "",
      };
    }

    setformerr(errdata);

    if (error === false) {
      const getlogindata = async () => {
        if (formchange.image === "") {
          const formdata = new FormData();
          formdata.append("user_name", formchange.name);
          formdata.append("user_profession", formchange.profession);

          fetch(`${props.ApiDom}/RxRooster/users/update_user`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${loginDeteiles.token}`,
            },
            body: formdata,
          })
            .then((response) => response.json())
            .then((data) => {
              settost({ status: true, message: data.message, succesful: data.success })
              localStorage.setItem(
                "RxroosterUserdetails",
                JSON.stringify(data.data)
              );
              setuserdata(data.data);
            });
        } else {
          const formdata = new FormData();
          formdata.append("user_name", formchange.name);
          formdata.append("user_profession", formchange.profession);
          formdata.append("Profile_image", formchange.image);

          fetch(`${props.ApiDom}/RxRooster/users/update_user`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${loginDeteiles.token}`,
            },
            body: formdata,
          })
            .then((response) => response.json())
            .then((data) => {
              localStorage.setItem(
                "RxroosterUserdetails",
                JSON.stringify(data.data)
              );
              setuserdata(data.data);
            });
        }
      };
      getlogindata();
      setupdeteprofile(false);
    }
  };

  const edituserdetailes = () => {
    setformchange({
      image: '',
      name: userdata.user_name ? userdata.user_name : "",
      profession: userdata.user_profession ? userdata.user_profession._id : "",
    });
    userdata.profile_picture &&
      setimages(`${props.ApiDom}${userdata.profile_picture}`);
  };

  return (
    <>
      <header>
        <div className="row align-items-center">
          <div className="col-6">
            <Link href="index.html">
              <img
                src="assets/images/logo.png"
                alt="Logo"
                className="logo_img"
              />
            </Link>
          </div>
          {validate ? (
            <>
              <div className="col-6 text-end">
                <div className="justify-content-end d-flex align-items-center">
                  <Dropdown className="notification">
                    <Dropdown.Toggle
                      as={"div"}
                      className={"nt_icon"}
                    >
                      <div onClick={getnotification}>
                        <svg
                          width="20"
                          height="23"
                          viewBox="0 0 20 23"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            style={{ maskType: "alpha" }}
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="20"
                            height="19"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.125 0.041687H19.3926V18.1125H0.125V0.041687Z"
                              fill="white"
                            />
                          </mask>
                          <g mask="url(#mask0_418_1198)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.75731 1.60419C6.11668 1.60419 3.57918 4.45627 3.57918 7.01565C3.57918 9.18127 2.97814 10.1823 2.44689 11.0656C2.02085 11.775 1.68439 12.3354 1.68439 13.5531C1.85835 15.5177 3.15522 16.55 9.75731 16.55C16.3229 16.55 17.6604 15.4719 17.8333 13.4854C17.8302 12.3354 17.4938 11.775 17.0677 11.0656C16.5365 10.1823 15.9354 9.18127 15.9354 7.01565C15.9354 4.45627 13.3979 1.60419 9.75731 1.60419ZM9.75731 18.1125C4.88647 18.1125 0.484389 17.7688 0.125014 13.6198C0.121889 11.9031 0.645847 11.0302 1.10835 10.2615C1.57606 9.48231 2.01668 8.74794 2.01668 7.01565C2.01668 3.64794 5.1271 0.041687 9.75731 0.041687C14.3875 0.041687 17.4979 3.64794 17.4979 7.01565C17.4979 8.74794 17.9386 9.48231 18.4063 10.2615C18.8688 11.0302 19.3927 11.9031 19.3927 13.5531C19.0292 17.7688 14.6281 18.1125 9.75731 18.1125Z"
                              fill="#438BFB"
                            />
                          </g>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.70656 22.4375H9.70448C8.53677 22.4365 7.43156 21.9219 6.59302 20.9875C6.30448 20.6677 6.33052 20.1729 6.65135 19.8854C6.97219 19.5958 7.46594 19.6219 7.75448 19.9438C8.29406 20.5448 8.98677 20.875 9.70552 20.875H9.70656C10.4284 20.875 11.1243 20.5448 11.6649 19.9427C11.9545 19.6229 12.4482 19.5969 12.768 19.8854C13.0889 20.174 13.1149 20.6688 12.8264 20.9885C11.9847 21.9229 10.8774 22.4375 9.70656 22.4375Z"
                            fill="#438BFB"
                          />
                        </svg>
                      </div>
                      {notificationCount > 0 && (<span className="ntf_count">{notificationCount}</span>)}

                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <div className="not_heading">
                        <h4>Notifications</h4>
                      </div>
                      {
                        notification.length > 0 ? (
                          <>
                            {notification.map((e, i) => {
                              const dateString = e.created_At;
                              const [fullDate, time] = dateString.split("T");
                              const [year, month, date] = fullDate.split("-");
                              const [hour, minute, second] = time.split(":");
                              const dateTime = `${date}/${month}/${year}`;
                              const now = new Date().toLocaleDateString();
                              let todaytime;
                              if (hour > 12) {
                                todaytime = `${hour - 12}:${minute} PM`
                              } else {
                                todaytime = `${hour}:${minute} AM`
                              }
                              return (
                                <Dropdown.Item className="m-0 p-0" key={`notification${i}`}>
                                  <li className="notification_list">
                                    <div className="ntf_icon">
                                      <img src="assets/images/notification.svg" alt="profile" />
                                    </div>
                                    <div className="ntf_detail">
                                      <h5 className="float-start">{e.title}</h5>
                                      <span className="float-end ntf-time">{dateTime === now ? todaytime : `${date}/${month}/${year}`}</span>
                                      <p>
                                        {e.description}
                                      </p>
                                    </div>
                                  </li>
                                </Dropdown.Item>
                              )
                            })}
                          </>
                        ) : (
                          <>
                            <p style={{ alignItems: "center", fontSize: "14px", color: "#b3b2b2" }}> No Notification Here</p>
                          </>
                        )
                      }

                    </Dropdown.Menu>
                  </Dropdown>
                  <div className="user-profile d-flex align-items-center">
                    <div className="profile">
                      {userdata.profile_picture ? (
                        <>
                          <img
                            src={`${props.ApiDom}${userdata.profile_picture}`}
                            alt="rxrooster"
                            className="img-fluid"
                          />
                        </>
                      ) : (
                        <>
                          <svg
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.9999 12.818C15.5216 12.818 18.4359 10.0114 18.4359 6.43592C18.4359 2.86041 15.5216 0 11.9999 0C8.47831 0 5.56403 2.80653 5.56403 6.38204C5.56403 9.95755 8.47831 12.818 11.9999 12.818ZM11.9999 1.99347C14.4489 1.99347 16.4424 3.98694 16.4424 6.38694C16.4424 8.78694 14.4489 10.7755 11.9999 10.7755C9.55096 10.7755 7.5575 8.78204 7.5575 6.38204C7.5575 3.98204 9.55096 1.99347 11.9999 1.99347Z"
                              fill="#D3D4EB"
                            />
                            <path
                              d="M16.3396 13.4302C15.9331 13.3273 15.5216 13.4302 15.2669 13.7387L12 17.4661L8.73306 13.7387C8.47837 13.4302 8.01796 13.3322 7.66041 13.4302C3.01224 14.9632 0 18.7396 0 22.9763C0 23.5396 0.460408 24 1.02367 24H22.9812C23.5445 24 24.0049 23.5396 24.0049 22.9763C24 18.7396 20.9878 14.9632 16.3396 13.4302ZM2.09143 22.0065C2.50286 19.2 4.54531 16.8 7.70939 15.5755L11.2849 19.6604C11.6424 20.1208 12.4065 20.1208 12.7641 19.6604L16.3396 15.5755C19.4547 16.8 21.551 19.2489 21.9576 22.0065H2.09143Z"
                              fill="#D3D4EB"
                            />
                          </svg>
                        </>
                      )}
                    </div>
                    <Dropdown>
                      <Dropdown.Toggle
                        as="div"
                        className="pr_name text-start"
                      >
                        {userdata.user_name
                          ? userdata.user_name
                          : userdata.mobile_number}
                        <span>
                          {userdata.user_profession
                            ? userdata.user_profession.profession_name
                            : "None"}
                        </span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="pr_dropdown p-0" >
                        <Dropdown.Item className="m-0 p-0 py-1">
                          <Link
                            className="dropdown-item"
                            onClick={() => {
                              setupdeteprofile(true);
                              edituserdetailes();
                            }}
                          >
                            Edit Profile
                          </Link>
                        </Dropdown.Item>
                        <Dropdown.Item className="m-0 p-0 py-1">
                          <Link className="dropdown-item" onClick={() => {
                            setlogoutmodal(true);
                          }
                          }>Log Out</Link>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="col-6 text-end">
                <div className="profile d-inline-block">
                  <svg
                    width="25"
                    height="24"
                    viewBox="0 0 25 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.9999 12.818C15.5216 12.818 18.4359 10.0114 18.4359 6.43592C18.4359 2.86041 15.5216 0 11.9999 0C8.47831 0 5.56403 2.80653 5.56403 6.38204C5.56403 9.95755 8.47831 12.818 11.9999 12.818ZM11.9999 1.99347C14.4489 1.99347 16.4424 3.98694 16.4424 6.38694C16.4424 8.78694 14.4489 10.7755 11.9999 10.7755C9.55096 10.7755 7.5575 8.78204 7.5575 6.38204C7.5575 3.98204 9.55096 1.99347 11.9999 1.99347Z"
                      fill="#D3D4EB"
                    />
                    <path
                      d="M16.3396 13.4302C15.9331 13.3273 15.5216 13.4302 15.2669 13.7387L12 17.4661L8.73306 13.7387C8.47837 13.4302 8.01796 13.3322 7.66041 13.4302C3.01224 14.9632 0 18.7396 0 22.9763C0 23.5396 0.460408 24 1.02367 24H22.9812C23.5445 24 24.0049 23.5396 24.0049 22.9763C24 18.7396 20.9878 14.9632 16.3396 13.4302ZM2.09143 22.0065C2.50286 19.2 4.54531 16.8 7.70939 15.5755L11.2849 19.6604C11.6424 20.1208 12.4065 20.1208 12.7641 19.6604L16.3396 15.5755C19.4547 16.8 21.551 19.2489 21.9576 22.0065H2.09143Z"
                      fill="#D3D4EB"
                    />
                  </svg>
                </div>
                <div className="text-end d-inline-block">
                  <button className="pr_name" type="button">
                    Guest
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      <Modal
        show={updeteprofile}
        onHide={() => {
          setimages("");
          setformerr({
            name: "",
            profession: "",
          })
          setupdeteprofile(false);   
               


        }}
        className="modal-dialog-centered modal-dialog-zoom "
        centered
      >
        <Modal.Header closeButton className="text-end pb-0">
          <Modal.Title>
            <h4 className="mb-0">Edit Profile</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <form className="text-start l_form " onSubmit={submitedform}>
            <div className="circle_img">
              {images === "" ? (
                <>
                  <svg
                    width="50%"
                    height="50%"
                    viewBox="0 0 25 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.9999 12.818C15.5216 12.818 18.4359 10.0114 18.4359 6.43592C18.4359 2.86041 15.5216 0 11.9999 0C8.47831 0 5.56403 2.80653 5.56403 6.38204C5.56403 9.95755 8.47831 12.818 11.9999 12.818ZM11.9999 1.99347C14.4489 1.99347 16.4424 3.98694 16.4424 6.38694C16.4424 8.78694 14.4489 10.7755 11.9999 10.7755C9.55096 10.7755 7.5575 8.78204 7.5575 6.38204C7.5575 3.98204 9.55096 1.99347 11.9999 1.99347Z"
                      fill="#D3D4EB"
                    />
                    <path
                      d="M16.3396 13.4302C15.9331 13.3273 15.5216 13.4302 15.2669 13.7387L12 17.4661L8.73306 13.7387C8.47837 13.4302 8.01796 13.3322 7.66041 13.4302C3.01224 14.9632 0 18.7396 0 22.9763C0 23.5396 0.460408 24 1.02367 24H22.9812C23.5445 24 24.0049 23.5396 24.0049 22.9763C24 18.7396 20.9878 14.9632 16.3396 13.4302ZM2.09143 22.0065C2.50286 19.2 4.54531 16.8 7.70939 15.5755L11.2849 19.6604C11.6424 20.1208 12.4065 20.1208 12.7641 19.6604L16.3396 15.5755C19.4547 16.8 21.551 19.2489 21.9576 22.0065H2.09143Z"
                      fill="#D3D4EB"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <img className="profile-pic img-fluid" alt="rxrooster" src={images} />
                </>
              )}
              <div
                className="p-image"
                onClick={() => {
                  inputref.current.click();
                }}
              >
                <div className="edit_img_icon upload-button" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: '100%' }}>
                  <svg
                    width="27"
                    height="26"
                    viewBox="0 0 27 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    
                  >
                    <path
                      d="M10.4054 11.4946C8.8053 11.4946 7.5105 10.1998 7.5105 8.59971C7.5105 6.99963 8.8053 5.70483 10.4054 5.70483C12.0055 5.70483 13.3002 6.99963 13.3002 8.59971C13.3002 10.1998 12.0055 11.4946 10.4054 11.4946ZM10.4054 7.28386C9.67902 7.28386 9.08952 7.87336 9.08952 8.59971C9.08952 9.32606 9.67902 9.91556 10.4054 9.91556C11.1317 9.91556 11.7212 9.32606 11.7212 8.59971C11.7212 7.87336 11.1317 7.28386 10.4054 7.28386Z"
                      fill="#67698E"
                    />
                    <path
                      d="M16.7214 24.1267H10.4054C4.68929 24.1267 2.24707 21.6845 2.24707 15.9684V9.6523C2.24707 3.93624 4.68929 1.49402 10.4054 1.49402H14.6161C15.0477 1.49402 15.4056 1.85193 15.4056 2.28353C15.4056 2.71513 15.0477 3.07304 14.6161 3.07304H10.4054C5.55249 3.07304 3.82609 4.79944 3.82609 9.6523V15.9684C3.82609 20.8213 5.55249 22.5477 10.4054 22.5477H16.7214C21.5743 22.5477 23.3007 20.8213 23.3007 15.9684V10.705C23.3007 10.2734 23.6586 9.91547 24.0902 9.91547C24.5218 9.91547 24.8797 10.2734 24.8797 10.705V15.9684C24.8797 21.6845 22.4375 24.1267 16.7214 24.1267Z"
                      fill="#67698E"
                    />
                    <path
                      d="M17.4267 10.4419C17.0161 10.4419 16.6371 10.2945 16.3635 10.0103C16.0371 9.68398 15.8792 9.19975 15.9529 8.70499L16.1634 7.24176C16.2161 6.87332 16.4371 6.42067 16.7108 6.1575L20.5321 2.33626C22.0585 0.809872 23.3848 1.6836 24.0375 2.33626C24.6586 2.95734 24.9428 3.61001 24.8796 4.28372C24.827 4.82059 24.5533 5.3364 24.0375 5.84169L20.2163 9.66293C19.9531 9.9261 19.5004 10.1472 19.132 10.2103L17.6688 10.4209C17.5846 10.4419 17.5003 10.4419 17.4267 10.4419ZM21.6374 3.46263L17.8162 7.28387C17.7846 7.31545 17.7319 7.43124 17.7214 7.48388L17.5214 8.85236L18.9004 8.66288C18.9425 8.65235 19.0583 8.59972 19.1004 8.55761L22.9217 4.73638C23.1532 4.50479 23.2901 4.29425 23.3006 4.13635C23.3217 3.91528 23.1006 3.64159 22.9217 3.46263C22.3743 2.91524 22.1216 2.9784 21.6374 3.46263Z"
                      fill="#67698E"
                    />
                    <path
                      d="M22.9323 6.63122C22.8586 6.63122 22.7849 6.62069 22.7217 6.59964C21.3112 6.19962 20.1848 5.07325 19.7848 3.66266C19.669 3.24158 19.9111 2.80998 20.3322 2.69419C20.7532 2.57839 21.1848 2.82051 21.3006 3.24158C21.5533 4.12584 22.2586 4.84166 23.1533 5.0943C23.5744 5.2101 23.8165 5.65222 23.7007 6.06277C23.5849 6.39963 23.2691 6.63122 22.9323 6.63122Z"
                      fill="#67698E"
                    />
                    <path
                      d="M3.7419 20.9161C3.48925 20.9161 3.23661 20.7898 3.08923 20.5687C2.84712 20.2108 2.94186 19.716 3.29977 19.4739L8.48949 15.9896C9.62639 15.2316 11.1949 15.3158 12.2265 16.1896L12.5739 16.4948C13.1002 16.9475 13.995 16.9475 14.5108 16.4948L18.89 12.7368C20.0058 11.7788 21.7638 11.7788 22.8902 12.7368L24.6061 14.2105C24.9324 14.4947 24.9745 14.9895 24.6903 15.3264C24.406 15.6527 23.9113 15.6948 23.5744 15.4106L21.8586 13.9368C21.3322 13.4842 20.4374 13.4842 19.9216 13.9368L15.5425 17.6949C14.4266 18.6528 12.6686 18.6528 11.5423 17.6949L11.1949 17.3896C10.7107 16.9791 9.91061 16.937 9.37375 17.3054L4.19455 20.7898C4.04717 20.874 3.88927 20.9161 3.7419 20.9161Z"
                      fill="#67698E"
                    />
                  </svg>
                </div>
                <input
                  className="file-upload"
                  name="image"
                  type="file"
                  accept="image/*"
                  ref={inputref}
                  onChange={changeform}
                />
              </div>
            </div>
            <div className="edit_form-group mb-4">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Dr.Allison Franci"
                className="rx-input"
                value={formchange.name}
                maxLength="25"
                style={{ width: "100%" }}
                onChange={(e) => {
                    changeform(e)
                }
                }
              />
              {formerr.name !== "" && (<p className="uplodeErr">{formerr.name}</p>)}
            </div>
            <div className="edit_form-group">
              <label>Profession</label>
              <select
                className="form-select"
                value={formchange.profession}
                name="profession"
                onChange={changeform}
              >
                <option value="">select</option>
                {professionlist.map((e) => {
                  return (
                    <option key={`option${e._id}`} value={e._id}>
                      {e.profession_name}
                    </option>
                  );
                })}
              </select>
              {formerr.profession !== "" && (<p className="uplodeErr">{formerr.profession}</p>)}
            </div>
            <button className="login-btn" type="submit" style={{ margin: "auto", display: "block", marginTop: "30px" }}>
              Update
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        show={logoutmodal}
        onHide={() => setlogoutmodal(false)}
        className="modal-dialog-centered modal-sm smoll modal-dialog-zoom"
        centered
      >
        <Modal.Body className="text-center px-0">
          <h5 className="mb-4">Are you sure you want to log out?</h5>

          <Button variant="secondary py-2 px-4 me-3 btn-lg" onClick={() => setlogoutmodal(false)}>No</Button>
          <Button variant="danger py-2 px-4 btn-lg" onClick={() => {
            signOut(fireauth).then(() => {
              setlogoutmodal(false)
              localStorage.clear();
              window.location.reload()
            }).catch((error) => {
              console.log(error)
            });

          }}>Yes</Button>

        </Modal.Body>
      </Modal>
      {tost.status && (<>{tost.succesful ? (<><div className="tost-message-green py-2 px-3 rounded-2 d-inline-block">{tost.message}</div></>) : (<><div className="tost-message-red py-2 px-3 rounded-2 d-inline-block">{tost.message}</div></>)}</>)}

    </>
  );
};

export default Header;
