import "./Editor.css";
import React from "react";
import ReactQuill from "react-quill";

const Editor = (props) => {
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

	return (
		<ReactQuill
			className="editor"
			theme="snow"
			modules={{ syntax: true, toolbar: props.readOnly ? false : modules }}
			value={props.value}
			onChange={props.onChange}
			readOnly={props.readOnly}
		/>
	);
};

export default Editor;
