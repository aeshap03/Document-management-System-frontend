
import React, { useEffect, useRef, useState } from "react";
import { Dropdown, Modal } from "react-bootstrap";
import Slider from "react-slick";
import Header from "../components/Header";
import { saveAs } from 'file-saver'
import { Link } from "react-router-dom";
import { Uploader } from "uploader";
import { UploadButton } from "react-uploader";

let validate = false;

let indexno;
let deleteno;
let viewdata;

const Home = (props) => {
  const [uploadDocumentModal, setuploadDocumentModal] = useState(false);
  const [detailsshowmodal, setdetailsshowmodal] = useState(false);
  const [imageslidermodal, setimageslidermodal] = useState(false);
  const [deletmodal, setdeletmodal] = useState(false);
  const [imagezoommodal, setimagezoommodal] = useState(false);
  const [images, setimages] = useState([]);
  const [newimages, setnewimages] = useState([]);
  const [loginModal, setloginModal] = useState(false);
  const [documentreload, setdocumentreload] = useState(false);
  const [deletImageid, setdeletImageid] = useState([]);

  const [tost, settost] = useState({ status: false, message: "", succesful: false })

  const loginDeteiles = JSON.parse(localStorage.getItem("RxroosterLogin"));
  const documentDetailes = JSON.parse(
    localStorage.getItem("RxroosterDocument")
  );

  loginDeteiles && (validate = loginDeteiles.is_verify);

  const [documentList, setdocumentList] = useState(
    documentDetailes ? documentDetailes : []
  );

  const [documentType, setdocumentType] = useState([]);

  const [slidercount, setslidercount] = useState(0);

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: slidercount,
  };

  const [formdata, setformdata] = useState({
    documentType: "",
    expireDate: "",
    discription: "",
    reminderDate: "",
    reminderTime: "",
    repeat: "Does not repeat",
    file: [],
  });

  const [formerr, setformerr] = useState({
    documentType: "",
    expireDate: "",
    discription: "",
    reminderDate: "",
    reminderTime: "",
    repeat: "",
    file: "",
  });

  const [editmode1, seteditmode1] = useState(false);

  const [searhshow, setsearhshow] = useState(false);

  const [searchdata, setsearchdata] = useState([]);

  const [searchchange, setsearchchange] = useState("");

  const [documentview, setdocumentview] = useState("");

  const formchange = (e) => {
    const { name, value } = e.target;
    setformdata((predata) => {
      if ([name] == "file") {
        const url = Array.from(e.target.files);
        const photo = url.map((a) => {
          return { url: window.URL.createObjectURL(a), name: a.name };
        });

        setnewimages([...newimages, ...photo]);
        return {
          ...predata,
          [name]: [...formdata.file, ...url],
        };
      } else {
        return {
          ...predata,
          [name]: value,
        };
      }
    });
  };

  const submitedform = (e) => {
    e.preventDefault();

    let error = false;

    let errdata = formerr;

    if (formdata.discription == "") {
      errdata = {
        ...errdata,
        discription: "Please Enter description",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        discription: "",
      };
    }

    if (formdata.documentType == "") {
      errdata = {
        ...errdata,
        documentType: "Please select Document type",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        documentType: "",
      };
    }

    if (formdata.expireDate == "") {
      errdata = {
        ...errdata,
        expireDate: "Please select Expire date",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        expireDate: "",
      };
    }

    if (formdata.file.length < 1 && images.length < 1) {
      errdata = {
        ...errdata,
        file: "Minimunm 1 file Required.",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        file: "",
      };
    }

    if (formdata.reminderDate == "") {
      errdata = {
        ...errdata,
        reminderDate: "Please select reminder date",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        reminderDate: "",
      };
    }

    if (formdata.reminderTime == "") {
      errdata = {
        ...errdata,
        reminderTime: "Please Enter reminder time",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        reminderTime: "",
      };
    }

    if (formdata.repeat == "") {
      errdata = {
        ...errdata,
        repeat: "Please select repeat reminder",
      };
      error = true;
    } else {
      errdata = {
        ...errdata,
        repeat: "",
      };
    }

    setformerr(errdata);

    if (error == false) {
      const [year, month, date] = formdata.reminderDate.split("-");
      const [hour, minute] = formdata.reminderTime.split(":");
      const dateTime = new Date(year, month - 1, date, hour, minute, 0);
      const remainder = new Date(dateTime.getTime() - (dateTime.getTimezoneOffset() * 60000)).toISOString();

      const [year1, month1, date1] = formdata.expireDate.split("-");
      const expa = new Date(year1, month1 - 1, parseInt(date1) + 1, 0, 0, 0);
      const expairy = expa.toISOString();

      if (editmode1) {
        const val = () => {
          const fdata = new FormData();
          fdata.append("document_id", indexno);
          fdata.append("document_description", formdata.discription);
          fdata.append("expire_date", expairy);
          fdata.append("reminder_date", remainder);
          fdata.append("reminder_time", remainder);
          fdata.append("reminder_repeat", formdata.repeat);
          fdata.append("file_type", "image/jpge");
          fdata.append("document_type", formdata.documentType);
          for (let i = 0; i < formdata.file.length; i++) {
            fdata.append("file", formdata.file[i]);
          }
          if (deletImageid.length > 0) {
            fdata.append('deleted_file', JSON.stringify(deletImageid));
          }
          try {
            fetch(
              `${props.ApiDom}/RxRooster/document/updateUserDocument`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${loginDeteiles.token}`,
                },
                body: fdata,
              }
            )
              .then((response) => response.json())
              .then((data) => {
                if (data.data != null) {
                  settost({ status: true, message: data.message, succesful: data.success })
                  const val = documentList.map((e) => {
                    if (e._id == data.data._id) {
                      return data.data
                    } else {
                      return e
                    }
                  })
                  setdocumentList(val);
                  localStorage.setItem(
                    "RxroosterDocument",
                    JSON.stringify(val)
                  );
                }
                seteditmode1(false);
              })
              .catch((err) => {
                settost({ status: true, message: "Something want to wrong.", succesful: false })
              })
          } catch (err) {
            settost({ status: true, message: "Something want to wrong.", succesful: false })
          }
        };

        val();
        seteditmode1(false);
        setimages([]);
        setnewimages([]);
      } else {
        const fdata = new FormData();
        fdata.append("document_description", formdata.discription);
        fdata.append("expire_date", expairy);
        fdata.append("reminder_date", remainder);
        fdata.append("reminder_time", remainder);
        fdata.append("reminder_repeat", formdata.repeat);
        fdata.append("file_type", "image/jpge");
        fdata.append("document_type", formdata.documentType);
        if (formdata.file.length > 0) {
          for (let i = 0; i < formdata.file.length; i++) {
            fdata.append("file", formdata.file[i]);
          }
        }

        const val = () => {
          try {
            fetch(
              `${props.ApiDom}/RxRooster/document/userDocumentAdd`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${loginDeteiles.token}`,
                },
                body: fdata,
              }
            )
              .then((response) => response.json())
              .then((data) => {
                if (data.data != null) {
                  setdocumentList([...documentList, data.data])
                  settost({ status: true, message: data.message, succesful: data.success })
                  localStorage.setItem(
                    "RxroosterDocument",
                    JSON.stringify([...documentList, data.data])
                  );
                  setimages([]);
                  setnewimages([]);
                }
              })
              .catch((err) => {
                settost({ status: true, message: "Something want to wrong.", succesful: false })
              })
          } catch (error) {
            settost({ status: true, message: 'Something want to wrong ', succesful: false })
          }
        };
        val();
      }
      setformdata({
        documentType: "",
        expireDate: "",
        discription: "",
        reminderDate: "",
        reminderTime: "",
        repeat: "Does not repeat",
        file: [],
      });
      setimages([]);
      setuploadDocumentModal(false);
    }
  };

  const deletImage = (e) => {
    const imageitem = newimages.filter((a, i) => {
      return e != i;
    });

    const fileimage = formdata.file.filter((a, i) => {
      return e != i;
    });

    setnewimages(imageitem);

    setformdata({ ...formdata, file: fileimage })
  };

  const editdocumentdata = (e) => {
    documentList.map((k) => {
      if (k._id == e) {
        const [fullDate, time] = k.reminder_date.split("T");
        const [year, month, date] = fullDate.split("-");
        const [hour, minute, second] = time.split(":");
        const dateTime = new Date(year, month, date, hour, minute, 0);
        const redate = dateTime.toLocaleDateString();
        const retime = `${dateTime.getHours()}:${dateTime.getMinutes()}`;

        const [fullDate1, time1] = k.expire_date.split("T");
        const [year1, month1, date1] = fullDate1.split("-");
        const dateTime1 = new Date(year1, month1, date1, 0, 0, 0);
        const exdate = dateTime1.toLocaleDateString();
        setformdata((predata) => {
          return {
            documentType: k.document_type._id,
            expireDate: `${year1}-${month1}-${date1}`,
            discription: k.document_description,
            reminderDate: `${year}-${month}-${date}`,
            reminderTime: `${hour}:${minute}`,
            repeat: k.reminder_repeat,
            file: [],
          };
        });

        const imgset = k.file.map((f) => {
          return { id: f._id, url: `${props.ApiDom}${f.file}` };
        });
        k.file.length > 0 && setimages(imgset);
      }
    });
  };

  const deleteDocument = () => {
    try {
      fetch(`${props.ApiDom}/RxRooster/document/deleteUserDocument`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${loginDeteiles.token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: deleteno,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const val = documentList.filter((e) => {
            return e._id != deleteno;
          });
          setdocumentList(val);
          settost({ status: true, message: data.message, succesful: data.success })
          localStorage.setItem("RxroosterDocument", JSON.stringify(val));
        });
    } catch (err) {
      settost({ status: true, message: 'Something want to wrong', succesful: false })
    }
  };

  const click = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];

  useEffect(
    (e) => {
      if (validate) {
        const getdocumentlist = () => {
          try {
            fetch(
              `${props.ApiDom}/RxRooster/document/userDocumentList`,
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
                localStorage.setItem(
                  "RxroosterDocument",
                  JSON.stringify(data.data)
                );
                setdocumentList(data.data);
              });
          } catch (err) {
            settost({ status: true, message: 'Something want to wrong', succesful: false })
          }
        };

        getdocumentlist();
      }
    },
    []
  );

  useEffect(() => {
    if (tost.status) {
      setTimeout(() => {
        settost({ status: false, message: "", succesful: false });
      }, 2000);
    }
  }, [tost])

  useEffect(() => {
    const getdocumenttype = () => {
      try {
        fetch(`${props.ApiDom}/RxRooster/document/userDocumentType`, {
          method: "POST",
          body: "",
        })
          .then((response) => response.json())
          .then((data) => {
            setdocumentType(data.data);

          });
      } catch (err) {
        settost({ status: true, message: 'Something want to wrong', succesful: false })
      }
    };
    getdocumenttype();
  }, []);

  const search = (e) => {
    setsearchchange(e.target.value);

    if (e.target.value != "") {
      setsearhshow(true);
      const newdata = documentList.filter(doc => {
        let re = new RegExp(e.target.value, "gi");
        let omg = doc.document_type.Document_name;
        return omg.match(re);
      });
      setsearchdata(newdata);
    } else {
      setsearhshow(false);
    }
  };

  const viewdata = (e) => {
    documentList.map((k) => {
      if (k._id == e) {
        const [fullDate, time] = k.expire_date.split("T");
        const [year, month, date] = fullDate.split("-");
        const dateTime = new Date(`${year}/${month}/${date}`);
        const now = new Date();
        let past;

        if (dateTime < now) {
          past = true;
        }
        setdocumentview({ data: k, exdate: `${date}-${month}-${year}`, past: past });
      }
    });
  };

  const downloadimage = (e) => {
    documentview.data.file.map((x) => {
      const [path1, path2, path3, name] = x.file.split("/");
      saveAs(`${props.ApiDom}${x.file}`, `${name}`)
    })
  }

  const [imageslider, setimageslider] = useState([]);

  return (
    <>
      <Header ApiDom={props.ApiDom} />
      {documentList.length > 0 ? (
        <>
          <div className="container-fluid">
            <div className="search mx-auto">
              <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                <div className="search_icon">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.1667 36.25C9.75001 36.25 2.08334 28.5833 2.08334 19.1667C2.08334 9.75001 9.75001 2.08334 19.1667 2.08334C28.5833 2.08334 36.25 9.75001 36.25 19.1667C36.25 28.5833 28.5833 36.25 19.1667 36.25ZM19.1667 4.58334C11.1167 4.58334 4.58334 11.1333 4.58334 19.1667C4.58334 27.2 11.1167 33.75 19.1667 33.75C27.2167 33.75 33.75 27.2 33.75 19.1667C33.75 11.1333 27.2167 4.58334 19.1667 4.58334Z"
                      fill="#B1B1B3"
                    />
                    <path
                      d="M36.6667 37.9167C36.35 37.9167 36.0333 37.8 35.7833 37.55L32.45 34.2167C31.9667 33.7333 31.9667 32.9333 32.45 32.45C32.9333 31.9667 33.7333 31.9667 34.2167 32.45L37.55 35.7833C38.0333 36.2667 38.0333 37.0667 37.55 37.55C37.3 37.8 36.9833 37.9167 36.6667 37.9167Z"
                      fill="#B1B1B3"
                    />
                  </svg>
                </div>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search your document"
                  aria-label="Search"
                  value={searchchange}
                  onChange={search}
                />
              </form>
            </div>
            <div className="document_upload">
              <div className="row">
                {searhshow ? (
                  <>
                    {searchdata.length > 0 ? searchdata.map((e) => {
                      const dateString = e.expire_date;
                      const [fullDate, time] = dateString.split("T");
                      const [year, month, date] = fullDate.split("-");
                      const [hour, minute, second] = time.split(":");
                      const dateTime = new Date(`${year}/${month}/${date}`);
                      const now = new Date();
                      return (
                        <div className="col-12 col-md-6" key={`searchdocument${e._id}`}>
                          <div className="d_item d-flex">
                            <a
                              className="detail_btn"
                              onClick={() => {
                                viewdata(e._id);
                                setdetailsshowmodal(true);
                              }}
                            ></a>
                            <div className="doc_img">
                              <img
                                src={
                                  e.file.length > 0
                                    ? e.file[0].file.includes("jpeg") || e.file[0].file.includes("jpg") || e.file[0].file.includes("png") ? `${props.ApiDom}${e.file[0].file}` : "./assets/images/placeholder.png"
                                    : "assets/images/imagenot.jpg"
                                }
                                className="img-fluid"
                                alt="rxrooster"
                              />
                            </div>
                            <div className="doc_detail_box">
                              {/* <div className="dropdown edit_doc_icon"> */}
                              <Dropdown className="edit_doc_icon">
                                <Dropdown.Toggle as={"button"}>
                                  <img
                                    src="assets/images/more.png"
                                    alt="rxrooster"
                                    className="img-fluid"
                                  />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="pr_dropdown p-0">
                                  <Dropdown.Item
                                    className="m-0 p-2"
                                    onClick={() => {
                                      indexno = e._id;
                                      seteditmode1(true);
                                      setuploadDocumentModal(true);
                                      editdocumentdata(e._id);
                                    }}
                                  >
                                    Update
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    className="m-0 p-2"
                                    onClick={() => {
                                      deleteno = e._id;
                                      setdeletmodal(true);
                                    }}
                                  >
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>

                              <h3>
                                {e.document_type
                                  ? e.document_type.Document_name
                                  : "Document"}
                              </h3>
                              <p>
                                {e.document_description
                                  ? e.document_description
                                  : ""}
                              </p>
                              <div className="bottom d-flex align-items-center justify-content-between">
                                <div className="file-attach">
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.1998 17.3799C11.4998 17.3799 10.7898 17.1099 10.2598 16.5799C9.73977 16.0599 9.44977 15.3699 9.44977 14.6399C9.44977 13.9099 9.73977 13.2099 10.2598 12.6999L11.6697 11.2899C11.9597 10.9999 12.4397 10.9999 12.7297 11.2899C13.0197 11.5799 13.0197 12.0599 12.7297 12.3499L11.3198 13.7599C11.0798 13.9999 10.9498 14.3099 10.9498 14.6399C10.9498 14.9699 11.0798 15.2899 11.3198 15.5199C11.8098 16.0099 12.5998 16.0099 13.0898 15.5199L15.3098 13.2999C16.5798 12.0299 16.5798 9.96994 15.3098 8.69994C14.0398 7.42994 11.9798 7.42994 10.7098 8.69994L8.28973 11.1199C7.77973 11.6299 7.49976 12.2999 7.49976 13.0099C7.49976 13.7199 7.77973 14.3999 8.28973 14.8999C8.57973 15.1899 8.57973 15.6699 8.28973 15.9599C7.99973 16.2499 7.51974 16.2499 7.22974 15.9599C6.43974 15.1699 6.00977 14.1199 6.00977 12.9999C6.00977 11.8799 6.43974 10.8299 7.22974 10.0399L9.64978 7.61992C11.4998 5.76992 14.5198 5.76992 16.3698 7.61992C18.2198 9.46992 18.2198 12.4899 16.3698 14.3399L14.1498 16.5599C13.6098 17.1099 12.9098 17.3799 12.1998 17.3799Z"
                                      fill="#438BFB"
                                    />
                                    <path
                                      d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z"
                                      fill="#438BFB"
                                    />
                                  </svg>
                                  <span>
                                    {e.file_length ? e.file_length : 0} File
                                    Attach
                                  </span>
                                </div>
                                {dateTime < now ? (
                                  <>
                                    <div className="date ex_date">
                                      Expire Date :{" "}
                                      {`${date}-${month}-${year}`}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="date">
                                      Expire Date :{" "}
                                      {`${date}-${month}-${year}`}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (<p className="text-center">No data Found</p>)}
                  </>
                ) : (
                  <>
                    {documentList.map((e) => {
                      const dateString = e.expire_date;
                      const [fullDate, time] = dateString.split("T");
                      const [year, month, date] = fullDate.split("-");
                      const [hour, minute, second] = time.split(":");
                      const dateTime = new Date(`${year}/${month}/${date}`);
                      const now = new Date();
                      return (
                        <div className="col-12 col-md-6" key={`documentlist${e._id}`}>
                          <div className="d_item d-flex">
                            <a
                              className="detail_btn"
                              onClick={() => {
                                viewdata(e._id);
                                setdetailsshowmodal(true);
                              }}
                            ></a>
                            <div className="doc_img">
                              <img
                                src={
                                  e.file.length > 0
                                    ? e.file[0].file.includes("jpeg") || e.file[0].file.includes("jpg") || e.file[0].file.includes("png") ? `${props.ApiDom}${e.file[0].file}` : "./assets/images/placeholder.png"
                                    : "assets/images/imagenot.jpg"
                                }
                                className="img-fluid"
                                alt="rxrooster"
                              />
                            </div>
                            <div className="doc_detail_box">
                              {/* <div className="dropdown edit_doc_icon"> */}
                              <Dropdown className="edit_doc_icon">
                                <Dropdown.Toggle as={"button"}>
                                  <img
                                    src="assets/images/more.png"
                                    alt="rxrooster"
                                    className="img-fluid"
                                  />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="pr_dropdown p-0">
                                  <Dropdown.Item
                                    className="m-0 p-2"
                                    onClick={() => {
                                      indexno = e._id;
                                      seteditmode1(true);
                                      setuploadDocumentModal(true);
                                      editdocumentdata(e._id);
                                    }}
                                  >
                                    Update
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    className="m-0 p-2"
                                    onClick={() => {
                                      deleteno = e._id;
                                      setdeletmodal(true);
                                    }}
                                  >
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>

                              <h3>
                                {e.document_type
                                  ? e.document_type.Document_name
                                  : "Document"}
                              </h3>
                              <p>
                                {e.document_description
                                  ? e.document_description
                                  : ""}
                              </p>
                              <div className="bottom d-flex align-items-center justify-content-between">
                                <div className="file-attach">
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.1998 17.3799C11.4998 17.3799 10.7898 17.1099 10.2598 16.5799C9.73977 16.0599 9.44977 15.3699 9.44977 14.6399C9.44977 13.9099 9.73977 13.2099 10.2598 12.6999L11.6697 11.2899C11.9597 10.9999 12.4397 10.9999 12.7297 11.2899C13.0197 11.5799 13.0197 12.0599 12.7297 12.3499L11.3198 13.7599C11.0798 13.9999 10.9498 14.3099 10.9498 14.6399C10.9498 14.9699 11.0798 15.2899 11.3198 15.5199C11.8098 16.0099 12.5998 16.0099 13.0898 15.5199L15.3098 13.2999C16.5798 12.0299 16.5798 9.96994 15.3098 8.69994C14.0398 7.42994 11.9798 7.42994 10.7098 8.69994L8.28973 11.1199C7.77973 11.6299 7.49976 12.2999 7.49976 13.0099C7.49976 13.7199 7.77973 14.3999 8.28973 14.8999C8.57973 15.1899 8.57973 15.6699 8.28973 15.9599C7.99973 16.2499 7.51974 16.2499 7.22974 15.9599C6.43974 15.1699 6.00977 14.1199 6.00977 12.9999C6.00977 11.8799 6.43974 10.8299 7.22974 10.0399L9.64978 7.61992C11.4998 5.76992 14.5198 5.76992 16.3698 7.61992C18.2198 9.46992 18.2198 12.4899 16.3698 14.3399L14.1498 16.5599C13.6098 17.1099 12.9098 17.3799 12.1998 17.3799Z"
                                      fill="#438BFB"
                                    />
                                    <path
                                      d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z"
                                      fill="#438BFB"
                                    />
                                  </svg>
                                  <span>
                                    {e.file_length ? e.file_length : 0} File
                                    Attach
                                  </span>
                                </div>
                                {dateTime < now ? (
                                  <>
                                    <div className="date ex_date">
                                      Expire Date :{" "}
                                      {`${date}-${month}-${year}`}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="date">
                                      Expire Date :{" "}
                                      {`${date}-${month}-${year}`}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            <div className="text-end uploadButton">
              <button
                className="rx_btn"
                onClick={() => {
                  setuploadDocumentModal(true);
                }}
              >
                Upload Document
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="container-fluid">
            <div className="search mx-auto">
              <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                <div className="search_icon">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.1667 36.25C9.75001 36.25 2.08334 28.5833 2.08334 19.1667C2.08334 9.75001 9.75001 2.08334 19.1667 2.08334C28.5833 2.08334 36.25 9.75001 36.25 19.1667C36.25 28.5833 28.5833 36.25 19.1667 36.25ZM19.1667 4.58334C11.1167 4.58334 4.58334 11.1333 4.58334 19.1667C4.58334 27.2 11.1167 33.75 19.1667 33.75C27.2167 33.75 33.75 27.2 33.75 19.1667C33.75 11.1333 27.2167 4.58334 19.1667 4.58334Z"
                      fill="#B1B1B3"
                    />
                    <path
                      d="M36.6667 37.9167C36.35 37.9167 36.0333 37.8 35.7833 37.55L32.45 34.2167C31.9667 33.7333 31.9667 32.9333 32.45 32.45C32.9333 31.9667 33.7333 31.9667 34.2167 32.45L37.55 35.7833C38.0333 36.2667 38.0333 37.0667 37.55 37.55C37.3 37.8 36.9833 37.9167 36.6667 37.9167Z"
                      fill="#B1B1B3"
                    />
                  </svg>
                </div>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search your document"
                  aria-label="Search"
                />
              </form>
            </div>
            <div className="small-box mx-auto text-center">
              <div className="welcome_msg">
                <h1>
                  Welcome to <span className="text-primary">Rx</span>Rooster
                </h1>
                <p>
                  You can upload your documents here. Your documents are safe
                  here
                </p>
                <a
                  href="#"
                  className="rx_btn1"
                  onClick={() => {
                    if (validate) {
                      setuploadDocumentModal(true);
                    } else {
                      setloginModal(true);
                    }
                  }}
                >
                  Upload Document
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* document Details modal */}
      <Modal
        show={detailsshowmodal}
        onHide={() => setdetailsshowmodal(false)}
        className="modal-dialog-centered  modal-lg"
        centered
      >
        <Modal.Header closeButton className="text-end pb-0">
          <Modal.Title>
            <h4>Document Details</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="mb-3">Details</h5>
          <div className="doc_desc">
            <h6 className="doc_title">
              {documentview.data && documentview.data.document_type
                ? documentview.data.document_type.Document_name
                : ""}
            </h6>
            <p>{documentview.data && documentview.data.document_description}</p>
            {documentview.past ? (
              <>
                <div className="date ex_date">
                  Expire Date : {documentview.exdate && documentview.exdate}
                </div>
              </>
            ) : (
              <>
                <div className="date">
                  Expire Date : {documentview.exdate && documentview.exdate}
                </div>
              </>
            )}
          </div>
          <h5 className="mb-3">Files</h5>
          <div className="proof_img">
            {documentview.data && documentview.data.file.length > 0 ? (
              <>
                {documentview.data.file.map((x, b) => {
                  if (x.file.includes("jpeg") || x.file.includes("jpg") || x.file.includes("png")) {
                    return (
                      <img
                        src={`${props.ApiDom}${x.file}`}
                        alt="rxrooster"
                        key={`imageview${b}`}
                        onClick={() => {
                          setimageslider(documentview.data.file);
                          setdetailsshowmodal(false);
                          setimageslidermodal(true);
                          setslidercount(b);
                        }}
                      />
                    );
                  } else {
                    return (
                      <a href={`${props.ApiDom}${x.file}`} target="new">
                        <img
                          src="./assets/images/placeholder.png"
                          alt="rxrooster"
                          key={`image${b}`}
                        // onClick={() => {
                        //   setimageslider(documentview.data.file);
                        //   setdetailsshowmodal(false);
                        //   setimageslidermodal(true);
                        //   setslidercount(b);
                        // }}
                        />
                      </a>
                    );
                  }
                })}
              </>
            ) : (
              <>
                <p>No file added</p>
              </>
            )}
          </div>

          <div className="text-end">
            <button
              className="login-btn text-center"
              onClick={() => downloadimage()}
            >
              Download
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Document Image slider */}
      <Modal
        show={imageslidermodal}
        onHide={() => {
          setdetailsshowmodal(true);
          setimageslidermodal(false);
        }}
        className="img-slider-modal modal-dialog-centered modal-lg"
        centered
      >
        <Modal.Header closeButton className="p-0"></Modal.Header>
        <Modal.Body>
          <Slider {...settings}>
            {imageslider.map((e, c) => {
              const [path1, path2, path3, name] = e.file.split("/");
              if (e.file.includes("jpeg") || e.file.includes("jpg") || e.file.includes("png")) {
                return (
                  <div className="slider__item" key={`imageslider${c}`}>

                    <img
                      src={`${props.ApiDom}${e.file}`}
                      alt="rxrooster"
                      className="slider-img"
                    />

                    <span className="img-name text-end">{name}</span>
                  </div>
                );
              } else {
                return (
                  <>
                    <div className="slider__item" key={`abc${c}`}>
                      <a href={`${props.ApiDom}${e.file}`} target="_blank">
                        <img
                          src="./assets/images/placeholder.png"
                          alt="rxrooster"
                          className="slider-img"
                        />
                      </a>
                      <span className="img-name text-end">{name}</span>
                    </div>
                  </>
                );
              }

            })}
          </Slider>
        </Modal.Body>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        show={uploadDocumentModal}
        onHide={() => {
          setuploadDocumentModal(false);
          setformdata({
            documentType: "",
            expireDate: "",
            discription: "",
            reminderDate: "",
            reminderTime: "",
            repeat: "Does not repeat",
            file: [],
          });
          setformerr({
            documentType: "",
            expireDate: "",
            discription: "",
            reminderDate: "",
            reminderTime: "",
            repeat: "",
            file: "",
          })
          seteditmode1(false);
          setimages([]);
          setnewimages([]);
        }}
        className="modal-dialog-centered modal-lg"
        centered
      >
        <Modal.Header closeButton className="pb-0">
          <h4>Upload Document</h4>
        </Modal.Header>
        <Modal.Body>
          <form className="add-detail-from" onSubmit={submitedform}>
            <div className="form-row mb-3">
              <h6>Files</h6>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "100%",
                  height: "100px",
                }}
              >
                <div className="uploader" style={{ fontSize: "16px" }}>
                  <div className="uploader__widget-base breakpoint-lg uploader__widget-base--draggable">
                    <div className="uploader__widget-base__children">
                      <label
                        className="btn btn--file btn--primary btn--upload"
                        htmlFor="uploader__input-323544"
                        style={{ width: "100%" }}
                      >
                        Upload a File
                        <input
                          id="uploader__input-323544"
                          type="file"
                          className="btn--file__input"
                          name="file"
                          accept="image/png, image/jpeg"
                          multiple
                          onChange={formchange}
                        />
                      </label>
                      <p className="text-secondary mb-0">
                        ...or drag and drop files.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {formerr.file != "" && (
                <p className="uplodeErr">{formerr.file}</p>
              )}
              <div className="proof_img">
                {images.map((e, i) => {
                  return (
                    <div
                      className="d-inline-block position-relative"
                      key={`image${i}`}
                    >{e.url.includes("jpeg") || e.url.includes("jpg") || e.url.includes("png") ? (
                      <>
                        <img
                          src={e.url}
                          alt="rxrooster"
                        />
                        <div className="bg-light-black"></div>
                      </>
                    ) : (
                      <>
                        <a href={e.url} target="_blank">
                          <img
                            src="./assets/images/placeholder.png"
                            alt="rxrooster"
                          />
                          <div className="bg-light-black"></div>
                        </a>
                      </>
                    )}
                      <button
                        type="button"
                        className="btn-close image-delet"
                        onClick={() => {
                          setdeletImageid([...deletImageid, e.id]);
                          const imageitem = images.filter((a, o) => {
                            return i != o;
                          });
                          setimages(imageitem);
                        }}
                      ></button>
                    </div>
                  );
                })}
                {newimages.map((e, i) => {
                  return (
                    <div
                      className="d-inline-block position-relative"
                      key={`newimage${i}`}
                    >
                      {e.name.includes("jpeg") || e.name.includes("jpg") || e.name.includes("png") ? (
                        <>
                          <img
                            src={e.url}
                            alt="rxrooster"
                          />
                          <div className="bg-light-black"></div>
                        </>
                      ) : (
                        <>
                          <a href={e.url} target="_blank">
                            <img
                              src="./assets/images/placeholder.png"
                              alt="rxrooster"
                            />
                            <div className="bg-light-black"></div>
                          </a>
                        </>
                      )}

                      <button
                        type="button"
                        className="btn-close image-delet"
                        onClick={() => deletImage(i)}
                      ></button>
                    </div>
                  );
                })}
              </div>
              {/* <input type="file" id="demo3" value="" /> */}
            </div>
            <div className="form-row mb-3">
              <h6>Add Details</h6>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label>Document Type</label>
                  <select
                    className="form-select"
                    value={formdata.documentType}
                    name="documentType"
                    onChange={formchange}
                  >
                    <option value="">Select</option>
                    {documentType.map((z) => (
                      <option key={`aaa${z._id}`} value={z._id}>
                        {z.Document_name}
                      </option>
                    ))}
                  </select>
                  {formerr.documentType != "" && (
                    <p className="uplodeErr">{formerr.documentType}</p>
                  )}
                </div>
                <div className="col-12 col-md-6 mb-3">
                  <label>Expire Date </label>
                  <input
                    type="date"
                    placeholder="Select date"
                    value={formdata.expireDate}
                    name="expireDate"
                    onChange={formchange}
                  />
                  {formerr.expireDate != "" && (
                    <p className="uplodeErr">{formerr.expireDate}</p>
                  )}
                </div>
                <div className="col-12">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter description"
                    value={formdata.discription}
                    name="discription"
                    onChange={formchange}
                  ></textarea>
                  {formerr.discription != "" && (
                    <p className="uplodeErr">{formerr.discription}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              <h6>Set Reminder</h6>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label>Reminder Date</label>
                  <input
                    type="date"
                    placeholder="Select date"
                    value={formdata.reminderDate}
                    name="reminderDate"
                    onChange={formchange}
                  />
                  {formerr.reminderDate != "" && (
                    <p className="uplodeErr">{formerr.reminderDate}</p>
                  )}
                </div>
                <div className="col-12 col-md-6 mb-3">
                  <label>Reminder Time</label>
                  <input
                    type="time"
                    value={formdata.reminderTime}
                    name="reminderTime"
                    onChange={formchange}
                    placeholder="Select time"
                  />
                  {formerr.reminderTime != "" && (
                    <p className="uplodeErr">{formerr.reminderTime}</p>
                  )}
                </div>
                <div className="col-12 col-md-6">
                  <label>Repeat</label>
                  <select
                    className="form-select"
                    value={formdata.repeat}
                    name="repeat"
                    onChange={formchange}
                  >
                    <option value="Does not repeat">Does not repeat</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                  {formerr.repeat != "" && (
                    <p className="uplodeErr">{formerr.repeat}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center mt-5">
              <button className="login-btn" type="submit">
                Save Document
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Delete Msessage Modal */}
      <Modal
        show={deletmodal}
        onHide={() => setdeletmodal(false)}
        className="modal-dialog-centered modal-dialog-zoom no-space"
        centered
      >
        <Modal.Body className="text-center">
          <img src="assets/images/dlt.png" className="img-fluid mt-2 mb-3" alt="rxrooster" />
          <h5 className="mb-0">
            Are you sure you want to delete this document?
          </h5>
          <div className="dlt_btn">
            <button className="not_dlt" onClick={() => setdeletmodal(false)}>
              No
            </button>
            <button
              className="yes_dlt"
              onClick={() => {
                setdeletmodal(false);
                deleteDocument();
              }}
            >
              Yes
            </button>
          </div>
        </Modal.Body>
      </Modal>


      <Modal
        show={loginModal}
        onHide={() => setloginModal(false)}
        className="modal-dialog-centered modal-dialog-zoom no-space"
        size={'md'}
        centered
      >
        <Modal.Header closeButton className="text-end pb-0"></Modal.Header>
        <Modal.Body className="text-center" >
          <h5 className="mb-4">Log in is required to upload documents</h5>
          <Link to="/login">
            <button
              className="login-btn"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              Login
            </button>
          </Link>
        </Modal.Body>
      </Modal>

      {tost.status && (<>{tost.succesful ? (<><div className="tost-message-green py-2 px-3 rounded-2 d-inline-block">{tost.message}</div></>) : (<><div className="tost-message-red py-2 px-3 rounded-2 d-inline-block">{tost.message}</div></>)}</>)}

    </>
  );
};

export default Home;
