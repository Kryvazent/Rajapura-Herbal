const supportedLanguages = new Set(["en", "si", "ta"]);

const asObject = (value) =>
  value && typeof value.toObject === "function" ? value.toObject() : value;

const languageFrom = (language) =>
  supportedLanguages.has(language) ? language : null;

const text = (translations, language, fallback = "") => {
  if (!language) return fallback;
  const selected = translations?.[language];
  const english = translations?.en;
  return (typeof selected === "string" && selected.trim())
    || (typeof english === "string" && english.trim())
    || fallback;
};

const list = (translations, language, fallback = []) => {
  if (!language) return fallback;
  const selected = translations?.[language];
  const english = translations?.en;
  return Array.isArray(selected) && selected.length
    ? selected
    : Array.isArray(english) && english.length ? english : fallback;
};

export const localizeProducts = (products, requestedLanguage) => {
  const language = languageFrom(requestedLanguage);
  if (!language) return products;
  return products.map((source) => {
    const product = asObject(source);
    return {
      ...product,
      name: text(product.translations?.name, language, product.name),
      category: text(product.translations?.category, language, product.category),
      description: text(product.translations?.description, language, product.description),
      benefits: list(product.translations?.benefits, language, product.benefits),
      ingredients: list(product.translations?.ingredients, language, product.ingredients),
      howToUse: list(product.translations?.howToUse, language, product.howToUse),
    };
  });
};

export const localizeServices = (services, requestedLanguage) => {
  const language = languageFrom(requestedLanguage);
  if (!language) return services;
  return services.map((source) => {
    const centre = asObject(source);
    return {
      ...centre,
      name: text(centre.translations?.name, language, centre.name),
      area: text(centre.translations?.area, language, centre.area),
      address: text(centre.translations?.address, language, centre.address),
      mapLabel: text(centre.translations?.mapLabel, language, centre.mapLabel),
      description: text(centre.translations?.description, language, centre.description),
      services: (centre.services ?? []).map((sourceItem) => {
        const item = asObject(sourceItem);
        return {
          ...item,
          name: text(item.translations?.name, language, item.name),
          description: text(item.translations?.description, language, item.description),
          duration: text(item.translations?.duration, language, item.duration),
        };
      }),
    };
  });
};

export const localizeShops = (provinces, requestedLanguage) => {
  const language = languageFrom(requestedLanguage);
  if (!language) return provinces;
  return provinces.map((sourceProvince) => {
    const province = asObject(sourceProvince);
    return {
      ...province,
      name: text(province.translations?.name, language, province.name),
      districts: (province.districts ?? []).map((sourceDistrict) => {
        const district = asObject(sourceDistrict);
        return {
          ...district,
          name: text(district.translations?.name, language, district.name),
          towns: (district.towns ?? []).map((sourceTown) => {
            const town = asObject(sourceTown);
            return {
              ...town,
              name: text(town.translations?.name, language, town.name),
              shops: (town.shops ?? []).map((sourceShop) => {
                const shop = asObject(sourceShop);
                return {
                  ...shop,
                  name: text(shop.translations?.name, language, shop.name),
                  address: text(shop.translations?.address, language, shop.address),
                  hours: text(shop.translations?.hours, language, shop.hours),
                };
              }),
            };
          }),
        };
      }),
    };
  });
};

export const localizeTeam = (members, requestedLanguage) => {
  const language = languageFrom(requestedLanguage);
  if (!language) return members;
  return members.map((source) => {
    const member = asObject(source);
    return {
      ...member,
      name: text(member.translations?.name, language, member.name),
      title: text(member.translations?.title, language, member.title),
      description: text(member.translations?.description, language, member.description),
    };
  });
};
