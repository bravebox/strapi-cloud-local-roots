import type { Schema, Struct } from '@strapi/strapi';

export interface SharedCooking extends Struct.ComponentSchema {
  collectionName: 'components_shared_cookings';
  info: {
    description: '';
    displayName: 'Cooking';
    icon: 'clock';
  };
  attributes: {
    CookingMethod: Schema.Attribute.Enumeration<
      ['Cook', 'Grill', 'Oven', 'Blanching', 'Microwave', 'Raw']
    > &
      Schema.Attribute.Required;
    Info: Schema.Attribute.Blocks;
    Value: Schema.Attribute.String;
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
    Nutrient: Schema.Attribute.Enumeration<
      ['Energy', 'Protein', 'Fat', 'Sugar', 'Salt']
    > &
      Schema.Attribute.Required;
    Percentage: Schema.Attribute.Decimal;
    Unit: Schema.Attribute.Enumeration<['Kcal', 'Gram']> &
      Schema.Attribute.Required;
    Value: Schema.Attribute.Decimal & Schema.Attribute.Required;
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

export interface SharedShelflive extends Struct.ComponentSchema {
  collectionName: 'components_shared_shelflives';
  info: {
    description: '';
    displayName: 'Shelflife';
    icon: 'archive';
  };
  attributes: {
    Days: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    Info: Schema.Attribute.Blocks;
    Temperature: Schema.Attribute.Enumeration<
      ['Room', 'Refrigerator', 'Freezer']
    >;
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.cooking': SharedCooking;
      'shared.media': SharedMedia;
      'shared.nutrient': SharedNutrient;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.shelflive': SharedShelflive;
      'shared.slider': SharedSlider;
    }
  }
}
