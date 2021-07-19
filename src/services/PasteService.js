class PasteService {
	static get(id) {
		return fetch("/paste/" + id, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	static create(master) {
		return fetch("/paste", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Paste-Master": master,
			},
		});
	}

	static update(masterPassword, id, text) {
		return fetch("/paste/" + id, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-Paste-Master": masterPassword,
			},
			body: JSON.stringify({
				text,
			}),
		});
	}
}

export default PasteService;
