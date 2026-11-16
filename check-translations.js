import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.join(__dirname, "public", "intl", "messages");
const TEMPLATE_FILE = "en-US.json";
const PLACEHOLDER = "TODO: translate";

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function fillMissingKeys(template, target) {
	let added = 0;
	const result = {};

	for (const [section, entries] of Object.entries(template)) {
		const targetSection = target[section] || {};
		const mergedSection = {};

		for (const key of Object.keys(entries)) {
			if (key in targetSection) {
				mergedSection[key] = targetSection[key];
			} else {
				mergedSection[key] = PLACEHOLDER;
				added++;
			}
		}

		for (const key of Object.keys(targetSection)) {
			if (!(key in mergedSection)) {
				mergedSection[key] = targetSection[key];
			}
		}

		result[section] = mergedSection;
	}

	for (const section of Object.keys(target)) {
		if (!(section in result)) {
			result[section] = target[section];
		}
	}

	return { result, added };
}

function main() {
	const template = readJson(path.join(MESSAGES_DIR, TEMPLATE_FILE));
	const files = fs
		.readdirSync(MESSAGES_DIR)
		.filter((f) => f.endsWith(".json") && f !== TEMPLATE_FILE);

	let totalAdded = 0;
	const report = [];

	for (const file of files) {
		const filePath = path.join(MESSAGES_DIR, file);
		const target = readJson(filePath);
		const { result, added } = fillMissingKeys(template, target);

		if (added > 0) {
			writeJson(filePath, result);
			report.push({ file, added });
			totalAdded += added;
		}
	}

	if (report.length === 0) {
		console.log("All translation files are complete.");
	} else {
		console.log("Missing keys added:");
		for (const { file, added } of report) {
			console.log(`  ${file}: +${added}`);
		}
		console.log(
			`Total: ${totalAdded} key(s) added across ${report.length} file(s).`,
		);
	}
}

main();
