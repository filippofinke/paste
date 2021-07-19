import "react-quill/dist/quill.snow.css";
import "./App.css";
import { useEffect, useState } from "react";
import generator from "generate-password";
import PasteService from "./services/PasteService";
import Editor from "./components/Editor/Editor";
import Footer from "./components/Footer/Footer";
import Aes256GCM from "./utils/Aes256GCM";

const App = () => {
	const [id, setId] = useState("");
	const [masterPassword, setMasterPassword] = useState("");
	const [password, setPassword] = useState("");
	const [text, setText] = useState("");
	const [readOnly, setReadOnly] = useState(false);

	const handleTextChange = (text) => {
		if (!id) {
			PasteService.create(masterPassword)
				.then((response) => response.json())
				.then((json) => {
					setId(json.id);
				});
		}

		setText(text);
		let encrypted = text ? Aes256GCM.encrypt(text, password) : "";
		PasteService.update(masterPassword, id, encrypted);
	};

	const copyLinkToClipboard = (event) => {
		let url =
			window.location.protocol +
			"//" +
			window.location.host +
			"/" +
			id +
			"#" +
			password;

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
			<Editor
				value={text}
				onChange={handleTextChange}
				readOnly={readOnly}
			></Editor>
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
				</div>
			)}
			<Footer></Footer>
		</div>
	);
};

export default App;
