import "react-quill/dist/quill.snow.css";
import "./App.css";
import ReactQuill from "react-quill";
import { useEffect, useState } from "react";
import aes256 from "aes256";
import generator from "generate-password";

const App = () => {
	const [masterPassword, setMasterPassword] = useState("");
	const [id, setId] = useState("");
	const [password, setPassword] = useState("");
	const [text, setText] = useState("");
	const [readOnly, setReadOnly] = useState(false);

	let modules = [
		[{ font: [] }, { size: [] }],
		[{ align: [] }, "direction"],
		["bold", "italic", "underline", "strike"],
		[{ color: [] }, { background: [] }],
		[{ script: "super" }, { script: "sub" }],
		["blockquote", "code-block"],
		[
			{ list: "ordered" },
			{ list: "bullet" },
			{ indent: "-1" },
			{ indent: "+1" },
		],
		["link"],
		["clean"],
	];

	const handleTextChange = (text) => {
		let encrypted = aes256.encrypt(password, text);
		setText(text);
		fetch("/paste/" + id, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-Paste-Master": masterPassword,
			},
			body: JSON.stringify({ text: encrypted }),
		});
	};

	const copyLinkToClipboard = () => {
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
			.then(() => {})
			.catch((err) => {});
	};

	useEffect(() => {
		let id = window.location.pathname.substr(1);
		let pass = window.location.hash.substr(1);
		if (id && pass) {
			fetch("/paste/" + id, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((json) => {
					let text = "";
					if (json.text) text = aes256.decrypt(pass, json.text);
					setText(text);
					setReadOnly(true);
				});
		}

		setPassword(generator.generate({ length: 24, numbers: true }));
		let master = generator.generate({ length: 64, numbers: true });
		setMasterPassword(master);

		fetch("/paste", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Paste-Master": master,
			},
		})
			.then((response) => response.json())
			.then((json) => {
				setId(json.id);
			});
		// eslint-disable-next-line
	}, []);

	return (
		<div className="app">
			<ReactQuill
				className="editor"
				theme="snow"
				modules={{ toolbar: readOnly ? false : modules }}
				value={text}
				onChange={handleTextChange}
				readOnly={readOnly}
			/>
			{!readOnly && (
				<div className="link">
					<button onClick={copyLinkToClipboard}>Click to copy the link</button>
				</div>
			)}
		</div>
	);
};

export default App;
