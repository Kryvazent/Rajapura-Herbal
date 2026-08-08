import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import Service from "../models/service.js";
import Shop from "../models/Shop.js";
import TeamMember from "../models/TeamMember.js";
import {
  localizeProducts,
  localizeServices,
  localizeShops,
  localizeTeam,
} from "../utils/localize.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const translationsDirectory = path.join(
  repositoryRoot,
  "frontend/src/app/i18n/translations",
);
const outputPath = path.join(repositoryRoot, "frontend/public/full-text.txt");
const languageNames = { en: "ENGLISH", si: "SINHALA", ta: "TAMIL" };
const languages = Object.keys(languageNames);

dotenv.config({ path: path.join(repositoryRoot, "backend/.env") });

const isReadableText = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  const text = value.trim();
  return !(
    text.startsWith("http://")
    || text.startsWith("https://")
    || text.startsWith("/")
    || text.startsWith("#")
    || text.startsWith("rgba(")
  );
};

const collectStrings = (value, output = []) => {
  if (isReadableText(value)) {
    output.push(value.trim());
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, output));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, output));
  }
  return output;
};

const unique = (items) => [...new Set(items)];

const loadStaticTranslations = async () => {
  const files = (await fs.readdir(translationsDirectory))
    .filter((file) => file.endsWith(".ts"))
    .sort();
  const content = Object.fromEntries(
    languages.map((language) => [language, []]),
  );
  const shared = [];

  for (const file of files) {
    const source = await fs.readFile(path.join(translationsDirectory, file), "utf8");
    const transformed = source
      .replace(
        /export const\s+([A-Za-z_$][\w$]*)(?:\s*:[^=]+)?\s*=/g,
        "globalThis.$1 =",
      )
      .replace(/\s+as const/g, "");
    const context = {};
    vm.createContext(context);
    vm.runInContext(transformed, context, { filename: file });

    for (const [exportName, value] of Object.entries(context)) {
      const title = `[${path.basename(file, ".ts")} / ${exportName}]`;
      const hasLanguages = languages.every((language) =>
        Object.prototype.hasOwnProperty.call(value ?? {}, language));

      if (hasLanguages) {
        for (const language of languages) {
          const strings = unique(collectStrings(value[language]));
          if (strings.length) content[language].push(title, ...strings, "");
        }
      } else {
        const strings = unique(collectStrings(value));
        if (strings.length) shared.push(title, ...strings, "");
      }
    }
  }

  return { content, shared };
};

const addField = (lines, label, value) => {
  if (isReadableText(value)) lines.push(`${label}: ${value.trim()}`);
};

const databaseText = (products, services, shops, team) => {
  const sections = [];

  for (const language of languages) {
    const localizedProductsData = localizeProducts(products, language);
    const localizedServicesData = localizeServices(services, language);
    const localizedShopsData = localizeShops(shops, language);
    const localizedTeamData = localizeTeam(team, language);
    const lines = [`=== ${languageNames[language]} ===`, ""];

    lines.push("[PRODUCTS]");
    localizedProductsData.forEach((product, index) => {
      lines.push(`${index + 1}. ${product.name}`);
      addField(lines, "Category", product.category);
      addField(lines, "Description", product.description);
      addField(lines, "Price", product.price);
      if (product.benefits?.length) lines.push(`Benefits: ${product.benefits.join("; ")}`);
      if (product.ingredients?.length) lines.push(`Ingredients: ${product.ingredients.join("; ")}`);
      if (product.howToUse?.length) lines.push(`How to use: ${product.howToUse.join("; ")}`);
      lines.push("");
    });

    lines.push("[SERVICES AND WELLNESS CENTRES]");
    localizedServicesData.forEach((centre, index) => {
      lines.push(`${index + 1}. ${centre.name}`);
      addField(lines, "Area", centre.area);
      addField(lines, "Address", centre.address);
      addField(lines, "Description", centre.description);
      addField(lines, "Phone", centre.mobile);
      addField(lines, "Alternate phone", centre.altMobile);
      (centre.services ?? []).forEach((service) => {
        lines.push(`- ${service.name}`);
        addField(lines, "  Description", service.description);
        addField(lines, "  Duration", service.duration);
      });
      lines.push("");
    });

    lines.push("[STORE LOCATIONS]");
    localizedShopsData.forEach((province) => {
      lines.push(`Province: ${province.name}`);
      (province.districts ?? []).forEach((district) => {
        lines.push(`  District: ${district.name}`);
        (district.towns ?? []).forEach((town) => {
          lines.push(`    Town: ${town.name}`);
          (town.shops ?? []).forEach((shop) => {
            lines.push(`      - ${shop.name}`);
            addField(lines, "        Address", shop.address);
            addField(lines, "        Phone", shop.phone);
            addField(lines, "        Hours", shop.hours);
            addField(lines, "        Type", shop.type);
          });
        });
      });
      lines.push("");
    });

    lines.push("[TEAM]");
    localizedTeamData.forEach((member, index) => {
      lines.push(`${index + 1}. ${member.name}`);
      addField(lines, "Title", member.title);
      addField(lines, "Description", member.description);
      lines.push("");
    });

    sections.push(lines.join("\n"));
  }

  return sections.join("\n\n");
};

const main = async () => {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!mongoUrl) throw new Error("MONGO_URL or MONGODB_URI is required");

  const [{ content, shared }] = await Promise.all([
    loadStaticTranslations(),
    mongoose.connect(mongoUrl),
  ]);

  const [products, services, shops, team] = await Promise.all([
    Product.find({}).lean(),
    Service.find({}).lean(),
    Shop.find({}).lean(),
    TeamMember.find({}).sort({ displayOrder: 1, createdAt: 1 }).lean(),
  ]);

  const staticSections = languages.map((language) => [
    `=== ${languageNames[language]} ===`,
    "",
    ...content[language],
  ].join("\n"));

  const output = [
    "RAJAPURA HERBAL COMPANY — COMPLETE PUBLIC WEBSITE TEXT",
    "Languages: English, Sinhala, Tamil",
    `Generated: ${new Date().toISOString()}`,
    "",
    "STATIC WEBSITE CONTENT",
    "======================",
    "",
    ...staticSections,
    "SHARED CONTENT",
    "==============",
    "",
    ...shared,
    "CURRENT DATABASE CONTENT",
    "========================",
    "",
    databaseText(products, services, shops, team),
    "",
  ].join("\n");

  await fs.writeFile(outputPath, output, "utf8");
  console.log(`Generated ${outputPath}`);
  console.log(
    `Included ${products.length} products, ${services.length} service centres, `
    + `${shops.length} provinces, and ${team.length} team members.`,
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
