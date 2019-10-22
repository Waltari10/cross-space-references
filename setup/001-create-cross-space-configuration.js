module.exports = function(migration) {
  const crossSpaceConfiguration = migration
    .createContentType("crossSpaceConfiguration")
    .name("Cross Space Configuration")
    .description("")
    .displayField("identifier");

  crossSpaceConfiguration
    .createField("identifier")
    .name("Identifier")
    .type("Symbol")
    .localized(false)
    .required(true)
    .validations([
      {
        unique: true
      }
    ])
    .disabled(false)
    .omitted(false);

  crossSpaceConfiguration
    .createField("spaceId")
    .name("Space Id")
    .type("Symbol")
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);
  crossSpaceConfiguration
    .createField("deliveryToken")
    .name("Delivery Token")
    .type("Symbol")
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);
  crossSpaceConfiguration.changeFieldControl(
    "identifier",
    "builtin",
    "singleLine",
    {}
  );
  crossSpaceConfiguration.changeFieldControl(
    "spaceId",
    "builtin",
    "singleLine",
    {}
  );
  crossSpaceConfiguration.changeFieldControl(
    "deliveryToken",
    "builtin",
    "singleLine",
    {}
  );
};
