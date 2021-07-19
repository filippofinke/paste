const crypto = require("crypto");

class Aes256GCM {
	static encrypt(text, password) {
		const iv = crypto.randomBytes(16);
		const salt = crypto.randomBytes(64);
		const key = crypto.pbkdf2Sync(password, salt, 2145, 32, "sha512");
		const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
		const encrypted = Buffer.concat([
			cipher.update(text, "utf8"),
			cipher.final(),
		]);
		const tag = cipher.getAuthTag();
		return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
	}

	static decrypt(data, password) {
		const bData = Buffer.from(data, "base64");
		const salt = bData.slice(0, 64);
		const iv = bData.slice(64, 80);
		const tag = bData.slice(80, 96);
		const text = bData.slice(96);
		const key = crypto.pbkdf2Sync(password, salt, 2145, 32, "sha512");
		const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(tag);
		const decrypted =
			decipher.update(text, "binary", "utf8") + decipher.final("utf8");
		return decrypted;
	}
}

export default Aes256GCM;
