import type { Schema, Struct } from '@strapi/strapi';

export interface SharedCooking extends Struct.ComponentSchema {
  collectionName: 'components_shared_cookings';
  info: {
    description: '';
    displayName: 'Cooking';
    icon: 'clock';
  };
  attributes: {
    alternative_method: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    info_box: Schema.Attribute.Relation<'oneToOne', 'api::info-box.info-box'>;
    method: Schema.Attribute.Enumeration<
      ['Cook', 'Grill', 'Oven', 'Blanching', 'Microwave', 'Raw', 'Other']
    > &
      Schema.Attribute.Required;
    temperature: Schema.Attribute.String;
    value: Schema.Attribute.String;
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

export interface SharedOnboardingSlide extends Struct.ComponentSchema {
  collectionName: 'components_shared_onboarding_slides';
  info: {
    description: '';
    displayName: 'OnboardingSlide';
    icon: 'picture';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    cover: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
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
    displayName: 'Storage';
    icon: 'archive';
  };
  attributes: {
    days: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    info_box: Schema.Attribute.Relation<'oneToOne', 'api::info-box.info-box'>;
    type: Schema.Attribute.Enumeration<['Room', 'Refrigerator', 'Freezer']>;
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
      'shared.onboarding-slide': SharedOnboardingSlide;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.shelflive': SharedShelflive;
      'shared.slider': SharedSlider;
    }
  }
}
