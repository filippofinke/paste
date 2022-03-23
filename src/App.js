import "react-quill/dist/quill.snow.css";
import "./App.css";

import React, { useEffect, useState } from "react";
import generator from "generate-password";
import PasteService from "./services/PasteService";
import Editor from "./components/Editor/Editor";
import Footer from "./components/Footer/Footer";
import Aes256GCM from "./utils/Aes256GCM";
import htmlToFormattedText from "html-to-formatted-text";

const App = () => {
  const [id, setId] = useState(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updateTimeout, setUpdateTimeout] = useState(null);

  useEffect(() => {
    if (!id) return;
    clearTimeout(updateTimeout);
    setUpdateTimeout(
      setTimeout(() => {
        setSaving(true);
        let encrypted = text ? Aes256GCM.encrypt(text, password) : "";
        PasteService.update(masterPassword, id, encrypted).then(() => {
          setSaving(false);
        });
      }, 500)
    ); // eslint-disable-next-line
  }, [id, text]);

  const handleTextChange = async (text) => {
    setText(text);

    if (!id) {
      let response = await PasteService.create(masterPassword);
      let json = await response.json();
      setId(json.id);
    }
  };

  const copyLinkToClipboard = (event) => {
    let url = window.location.protocol + "//" + window.location.host + "/" + id + "#" + password;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        event.target.innerText = "Copied to clipboard!";
      })
      .catch((err) => {
        event.target.innerText = "Error copying the url to the clipboard!";
      });
  };

  useEffect(() => {
    let id = window.location.pathname.substr(1);
    let pass = window.location.hash.substr(1);
    if (id && pass) {
      PasteService.get(id).then((response) => {
        setReadOnly(true);
        if (response.status === 200) {
          response.json().then((json) => {
            if (json.text) {
              try {
                setText(Aes256GCM.decrypt(json.text, pass));
              } catch (e) {
                setText("Invalid password!");
              }
            }
          });
        } else {
          setText("Paste not found!");
        }
      });
    }

    setPassword(generator.generate({ length: 24, numbers: true }));
    setMasterPassword(generator.generate({ length: 64, numbers: true }));
    // eslint-disable-next-line
  }, []);

  return (
    <div className="app">
      <Editor value={text} onChange={handleTextChange} readOnly={readOnly}></Editor>
      {!readOnly ? (
        <div className="link">
          {id && (
            <button className="button" onClick={copyLinkToClipboard}>
              Click to copy the link
            </button>
          )}
        </div>
      ) : (
        <div className="link">
          <a className="button" href="/">
            Create an encrypted paste
          </a>
          <button
            className="button"
            onClick={() => {
              console.log(text);
              let newDoc = document.open("text/html", "replace");
              newDoc.write("<pre>" + htmlToFormattedText(text) + "</pre>");
            }}
          >
            Raw
          </button>
        </div>
      )}
      <Footer saving={saving}></Footer>
    </div>
  );
};

export default App;
