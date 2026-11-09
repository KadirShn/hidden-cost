import { Fragment } from 'react';
import { Controller, useFieldArray, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { MoneyInput } from '@/components/ui/money-input';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useSettings } from '@/features/settings/use-settings';
import { useTheme } from '@/hooks/use-theme';

import { createCustomCostRow } from './form-mapper';
import { costFrequencies, type CostFrequency, type WizardFormValues } from './form-schema';

type CostRowsEditorProps = {
  control: Control<WizardFormValues>;
  name: 'initialCosts' | 'recurringCosts';
  currency: string;
  title: string;
  body: string;
  addLabel: string;
};

export function CostRowsEditor({
  control,
  name,
  currency,
  title,
  body,
  addLabel,
}: CostRowsEditorProps) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const { fields, append, remove } = useFieldArray({ control, name });
  const showFrequency = name === 'recurringCosts';
  const frequencyOptions = costFrequencies.map((value) => ({
    value,
    label: t(`wizard.frequencies.${value}`),
  }));

  return (
    <Card>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText accessibilityRole="header" variant="subtitle">
          {title}
        </AppText>
        <AppText selectable variant="helper" tone="secondary">
          {body}
        </AppText>
      </View>
      {fields.map((field, index) => {
        const isCustom = field.key === '';
        const itemLabel = isCustom
          ? t('wizard.costRows.amount')
          : t(`costItems.${field.key}`, { defaultValue: field.label || field.key });
        return (
          <Fragment key={field.id}>
            {index > 0 ? <Divider /> : null}
            <View style={{ gap: theme.spacing.md }}>
              {isCustom ? (
                <Controller
                  control={control}
                  name={`${name}.${index}.label`}
                  render={({ field: input, fieldState }) => (
                    <TextField
                      ref={input.ref}
                      errorText={fieldState.error ? t('forms.requiredField') : undefined}
                      label={t('wizard.costRows.label')}
                      maxLength={80}
                      onBlur={input.onBlur}
                      onChangeText={input.onChange}
                      testID={`wizard-${name}-${index}-label`}
                      value={input.value}
                    />
                  )}
                />
              ) : null}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
                <View style={{ flexBasis: 160, flexGrow: 2 }}>
                  <Controller
                    control={control}
                    name={`${name}.${index}.amount`}
                    render={({ field: input, fieldState }) => (
                      <MoneyInput
                        ref={input.ref}
                        currency={currency}
                        errorText={fieldState.error ? t('forms.invalidMoney') : undefined}
                        label={itemLabel}
                        onBlur={input.onBlur}
                        onChangeText={input.onChange}
                        testID={`wizard-${name}-${index}-amount`}
                        value={input.value}
                      />
                    )}
                  />
                </View>
                {showFrequency ? (
                  <View style={{ flexBasis: 140, flexGrow: 1 }}>
                    <Controller
                      control={control}
                      name={`${name}.${index}.frequency`}
                      render={({ field: input }) => (
                        <SelectField<CostFrequency>
                          cancelLabel={t('common.cancel')}
                          label={t('wizard.costRows.frequency')}
                          modalTitle={t('wizard.costRows.frequencyTitle', { item: itemLabel })}
                          onChange={input.onChange}
                          openAccessibilityLabel={t('accessibility.openSelection', {
                            label: `${itemLabel}, ${t('wizard.costRows.frequency')}`,
                          })}
                          options={frequencyOptions}
                          selectedAccessibilityLabel={t('accessibility.selected')}
                          value={input.value}
                        />
                      )}
                    />
                  </View>
                ) : null}
              </View>
              {field.removable ? (
                <Button
                  accessibilityLabel={t('wizard.costRows.removeAccessible', { item: itemLabel })}
                  label={t('wizard.costRows.remove')}
                  onPress={() => remove(index)}
                  variant="ghost"
                />
              ) : null}
            </View>
          </Fragment>
        );
      })}
      {fields.length === 0 ? (
        <AppText selectable tone="secondary">
          {t('wizard.costRows.empty')}
        </AppText>
      ) : null}
      <Button
        label={addLabel}
        onPress={() => append(createCustomCostRow(locale, 'monthly'))}
        testID={`wizard-${name}-add`}
        variant="secondary"
      />
    </Card>
  );
}
