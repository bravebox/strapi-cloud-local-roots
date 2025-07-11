import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAddress extends Struct.ComponentSchema {
  collectionName: 'components_shared_addresses';
  info: {
    description: '';
    displayName: 'Address';
    icon: 'pinMap';
  };
  attributes: {
    address: Schema.Attribute.String;
    city: Schema.Attribute.String;
    country: Schema.Attribute.Enumeration<['Germany']> &
      Schema.Attribute.DefaultTo<'Germany'>;
    postal_code: Schema.Attribute.String;
    show_venue: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    venue: Schema.Attribute.String;
  };
}

export interface SharedComponents extends Struct.ComponentSchema {
  collectionName: 'components_shared_components';
  info: {
    displayName: 'Components';
    icon: 'seed';
  };
  attributes: {
    name: Schema.Attribute.Enumeration<
      [
        'Vitamin C',
        'Vitamin A',
        'Beta-Carotene',
        'Folic Acid',
        'Potassium',
        'Calcium Magnesium',
        'Iron',
        'Dietary Fiber',
        'Vitamin K',
        'Vitamin E',
        'Vitamin B6',
        'Zinc',
        'Phosphorus',
        'Copper',
        'Manganese',
        'Selenium',
        'Omega-3 Fatty Acids (ALA)',
      ]
    >;
  };
}

export interface SharedCooking extends Struct.ComponentSchema {
  collectionName: 'components_shared_cookings';
  info: {
    description: '';
    displayName: 'Cooking';
    icon: 'clock';
  };
  attributes: {
    info_box: Schema.Attribute.Relation<'oneToOne', 'api::info-box.info-box'>;
    method: Schema.Attribute.Enumeration<['Cook', 'Bake/Grill', 'Oven']> &
      Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

export interface SharedCookingAlternative extends Struct.ComponentSchema {
  collectionName: 'components_shared_cooking_alternatives';
  info: {
    description: '';
    displayName: 'CookingAlternative';
    icon: 'cloud';
  };
  attributes: {
    info_box: Schema.Attribute.Relation<'oneToOne', 'api::info-box.info-box'>;
    method: Schema.Attribute.Enumeration<['Blanching', 'Microwave', 'Raw']> &
      Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

export interface SharedCookingInstructions extends Struct.ComponentSchema {
  collectionName: 'components_shared_cooking_instructions';
  info: {
    displayName: 'CookingInstructions';
    icon: 'clock';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedHealth extends Struct.ComponentSchema {
  collectionName: 'components_shared_health';
  info: {
    description: '';
    displayName: 'Health';
    icon: 'heart';
  };
  attributes: {
    list: Schema.Attribute.Relation<
      'oneToMany',
      'api::health-reason.health-reason'
    >;
  };
}

export interface SharedIntolerances extends Struct.ComponentSchema {
  collectionName: 'components_shared_intolerances';
  info: {
    description: '';
    displayName: 'Intolerances';
    icon: 'emotionUnhappy';
  };
  attributes: {
    list: Schema.Attribute.Relation<
      'oneToMany',
      'api::intolerance.intolerance'
    >;
  };
}

export interface SharedList extends Struct.ComponentSchema {
  collectionName: 'components_shared_lists';
  info: {
    displayName: 'List';
    icon: 'bulletList';
  };
  attributes: {
    list_item: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedNutrient extends Struct.ComponentSchema {
  collectionName: 'components_shared_nutrients';
  info: {
    description: '';
    displayName: 'Nutrient';
    icon: 'seed';
  };
  attributes: {
    percentage: Schema.Attribute.Decimal;
    type: Schema.Attribute.Enumeration<
      ['Energy', 'Protein', 'Fat', 'Sugar', 'Salt']
    > &
      Schema.Attribute.Required;
    unit: Schema.Attribute.Enumeration<['Kcal', 'Gram']> &
      Schema.Attribute.Required;
    value: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

export interface SharedPhone extends Struct.ComponentSchema {
  collectionName: 'components_shared_phones';
  info: {
    displayName: 'Phone';
    icon: 'bell';
  };
  attributes: {
    allow_phone: Schema.Attribute.Boolean;
    phone: Schema.Attribute.String;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRecipeDetails extends Struct.ComponentSchema {
  collectionName: 'components_shared_recipe_details';
  info: {
    displayName: 'Recipe details';
    icon: 'crown';
  };
  attributes: {
    cooking_method: Schema.Attribute.Enumeration<
      ['Cook', 'Bake/Grill', 'Oven']
    >;
    cooking_time: Schema.Attribute.String;
    oven_temperature: Schema.Attribute.String;
    preparation_time: Schema.Attribute.String;
    total_time: Schema.Attribute.String;
  };
}

export interface SharedRecipeIngredient extends Struct.ComponentSchema {
  collectionName: 'components_shared_recipe_ingredients';
  info: {
    displayName: 'Recipe ingredient';
    icon: 'crown';
  };
  attributes: {
    descriptive_action: Schema.Attribute.Enumeration<
      [
        'Not applicable',
        'Minced',
        'Chopped',
        'Peeled',
        'Peeled and chopped',
        'Peeled and sliced',
        'Sliced',
        'Diced',
        'Cubed',
        'Grated',
        'Shredded',
        'Crushed',
        'Halved',
        'Quartered',
        'Zested',
        'Seeded',
        'Cored',
        'Trimmed',
        'Rinsed',
        'Washed',
        'Drained',
        'Beaten',
        'Whisked',
        'Mashed',
        'Julienned',
        'For garnish',
        'Garnish',
      ]
    > &
      Schema.Attribute.DefaultTo<'Not applicable'>;
    recipe_ingredient: Schema.Attribute.Relation<
      'oneToOne',
      'api::recipe-ingredient.recipe-ingredient'
    >;
    size: Schema.Attribute.Enumeration<
      ['Not applicable', 'Small', 'Medium', 'Large']
    > &
      Schema.Attribute.DefaultTo<'Not applicable'>;
    title_no_used: Schema.Attribute.String;
    unit: Schema.Attribute.Enumeration<
      [
        'Not applicable',
        'Teaspoon',
        'Tablespoon',
        'Cup',
        'Milliliter',
        'Liter',
        'Fluid ounce',
        'Pint',
        'Quart',
        'Gallon',
        'Drop',
        'Dash',
        'Pinch',
        'Gram',
        'Kilogram',
        'Milligram',
        'Ounce',
        'Pound',
        'Piece',
        'Slice',
        'Clove',
        'Leaf',
        'Stick',
        'Can',
        'Jar',
        'Bottle',
        'Packet',
        'Bunch',
        'Head',
        'Fillet',
        'Sheet',
        'Sprig',
      ]
    > &
      Schema.Attribute.DefaultTo<'Not applicable'>;
    value: Schema.Attribute.Decimal;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedStorage extends Struct.ComponentSchema {
  collectionName: 'components_shared_storages';
  info: {
    description: '';
    displayName: 'Storage';
    icon: 'archive';
  };
  attributes: {
    info_box: Schema.Attribute.Relation<'oneToOne', 'api::info-box.info-box'>;
    type: Schema.Attribute.Enumeration<
      ['Room', 'Refrigerator', 'Freezer', 'Not']
    >;
    unit: Schema.Attribute.Enumeration<['Days', 'Weeks', 'Months', 'Years']>;
    value: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.address': SharedAddress;
      'shared.components': SharedComponents;
      'shared.cooking': SharedCooking;
      'shared.cooking-alternative': SharedCookingAlternative;
      'shared.cooking-instructions': SharedCookingInstructions;
      'shared.health': SharedHealth;
      'shared.intolerances': SharedIntolerances;
      'shared.list': SharedList;
      'shared.media': SharedMedia;
      'shared.nutrient': SharedNutrient;
      'shared.phone': SharedPhone;
      'shared.quote': SharedQuote;
      'shared.recipe-details': SharedRecipeDetails;
      'shared.recipe-ingredient': SharedRecipeIngredient;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.storage': SharedStorage;
    }
  }
}
