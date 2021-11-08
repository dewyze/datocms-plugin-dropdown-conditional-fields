import values from 'object.values';

window.DatoCmsPlugin.init((plugin) => {
  // const slaveFields = plugin.parameters.instance.slaveFields.split(/\s*,\s*/);
  const triggerField = plugin.field;
  const dependencies = JSON.parse(plugin.parameters.instance.dependencies);
  const allFields = Object.values(dependencies).flat();

  function toggleValue(fieldApiKey, value) {
    const fields = dependencies[value] || [];
    return fields.includes(fieldApiKey);
  }

  function toggleField(dependentField, fieldApiKey, value) {
    const fieldPath = plugin.parentFieldId
      ? `${plugin.fieldPath.replace(/.[^.]*$/, '')}.${fieldApiKey}`
      : fieldApiKey;

    if (triggerField.attributes.localized) {
      if (dependentField.attributes.localized) {
        plugin.toggleField(`${fieldPath}.${plugin.locale}`, value);
      }
    } else if (dependentField.attributes.localized) {
      plugin.site.attributes.locales.forEach((locale) => {
        plugin.toggleField(`${fieldPath}.${locale}`, value);
      });
    } else {
      plugin.toggleField(fieldPath, value);
    }
  }

  function toggleFields(value) {
    allFields.forEach((fieldApiKey) => {
      const dependentField = values(plugin.fields).find((field) => {
        return field.attributes.api_key === fieldApiKey;
      });

      if (dependentField) {
        const toggle = toggleValue(fieldApiKey, value);
        toggleField(dependentField, fieldApiKey, toggle);
      } else {
        console.error(
          `Plugin error: The field "${fieldApiKey}" does not exist`,
        );
      }
    });

    // slaveFields.forEach((slaveFieldApiKey) => {
    //   const slaveField = values(plugin.fields).find(
    //     (field) => field.attributes.api_key === slaveFieldApiKey,
    //   );
    //
    //   if (slaveField) {
    //     const slavePath = plugin.parentFieldId
    //       ? `${plugin.fieldPath.replace(/.[^.]*$/, '')}.${slaveFieldApiKey}`
    //       : slaveFieldApiKey;
    //
    //     if (masterField.attributes.localized) {
    //       if (slaveField.attributes.localized) {
    //         plugin.toggleField(`${slavePath}.${plugin.locale}`, value);
    //       }
    //     } else if (slaveField.attributes.localized) {
    //       plugin.site.attributes.locales.forEach((locale) => {
    //         plugin.toggleField(`${slavePath}.${locale}`, value);
    //       });
    //     } else {
    //       plugin.toggleField(slavePath, value);
    //     }
    //   } else {
    //     console.error(
    //       `Plugin error: The field "${slaveFieldApiKey}" does not exist`,
    //     );
    //   }
    // });
  }

  function normaliseValue(value) {
    if (value) {
      return value.toLowerCase();
    }

    return null;
  }

  const initialValue = normaliseValue(plugin.getFieldValue(plugin.fieldPath));
  toggleFields(initialValue);

  plugin.addFieldChangeListener(plugin.fieldPath, (value) => {
    toggleFields(normaliseValue(value));
  });
});
