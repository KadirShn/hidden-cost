import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useNavigation, useRouter, type Href } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch, type Control, type FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  Alert,
  AppState,
  findNodeHandle,
  Switch,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { MoneyInput } from '@/components/ui/money-input';
import { NumberInput } from '@/components/ui/number-input';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { StepIndicator } from '@/components/ui/step-indicator';
import { TextField } from '@/components/ui/text-field';
import { useProject, useSaveProjectBundle } from '@/data/query/project-hooks';
import { useTemplate } from '@/data/query/template-hooks';
import { useRepositories } from '@/data/repositories/repository-provider';
import type { ProjectBundle, TemplateDefinition } from '@/data/repositories/types';
import { useSettings } from '@/features/settings/use-settings';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';
import { ownershipMonthBucket } from '@/services/observability/analytics-contracts';
import { telemetry } from '@/services/observability/telemetry-service';
import { formatLocalizedMoneyInput } from '@/utils/format';
import { parseLocalizedMoneyMinor } from '@/utils/parse-money';

import { CostRowsEditor } from './cost-rows-editor';
import { clearWizardDraft, readWizardDraft, writeWizardDraft } from './draft-store';
import { getEnergyProfile } from './energy-profile';
import { formToProjectBundle, projectBundleToForm } from './form-mapper';
import { createWizardFormSchema, wizardStepFields, type WizardFormValues } from './form-schema';

type ControlledFieldProps = {
  control: Control<WizardFormValues>;
  name: FieldPath<WizardFormValues>;
  label: string;
  helperText?: string;
};

function ControlledTextField({ control, name, label, helperText }: ControlledFieldProps) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          ref={field.ref}
          errorText={fieldState.error ? t('forms.invalidField') : undefined}
          helperText={helperText}
          label={label}
          onBlur={field.onBlur}
          onChangeText={field.onChange}
          testID={`wizard-${name}`}
          value={String(field.value ?? '')}
        />
      )}
    />
  );
}

function ControlledNumberField({ control, name, label, helperText }: ControlledFieldProps) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <NumberInput
          ref={field.ref}
          errorText={fieldState.error ? t('forms.invalidNumber') : undefined}
          helperText={helperText}
          label={label}
          onBlur={field.onBlur}
          onChangeText={field.onChange}
          testID={`wizard-${name}`}
          value={String(field.value ?? '')}
        />
      )}
    />
  );
}

function ControlledMoneyField({
  control,
  name,
  label,
  helperText,
  currency,
}: ControlledFieldProps & { currency: string }) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <MoneyInput
          ref={field.ref}
          currency={currency}
          errorText={fieldState.error ? t('forms.invalidMoney') : undefined}
          helperText={helperText}
          label={label}
          onBlur={field.onBlur}
          onChangeText={field.onChange}
          testID={`wizard-${name}`}
          value={String(field.value ?? '')}
        />
      )}
    />
  );
}

function WizardForm({
  bundle,
  template,
}: {
  bundle: ProjectBundle;
  template: TemplateDefinition | null;
}) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { settings } = useRepositories();
  const { isOffline } = useNetworkStatus();
  const [step, setStep] = useState(0);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepHeadingRef = useRef<Text>(null);
  const latestValues = useRef<WizardFormValues | undefined>(undefined);
  const schema = useMemo(() => createWizardFormSchema(locale), [locale]);
  const energyProfile = useMemo(
    () => getEnergyProfile(bundle.project, bundle.costItems),
    [bundle.costItems, bundle.project],
  );
  const usageUnit = bundle.project.usageUnit ?? 'use';
  const [initialValues] = useState(
    () =>
      readWizardDraft(settings, bundle.project.id) ??
      projectBundleToForm(bundle, template, energyProfile, locale),
  );
  const form = useForm<WizardFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });
  const values = useWatch({ control: form.control });
  const hasPendingAutosave = form.formState.isDirty;
  const saveBundle = useSaveProjectBundle(bundle.project.id);
  const totalSteps = wizardStepFields.length;
  const currency = bundle.project.currency;
  const countFilledRows = (name: 'initialCosts' | 'recurringCosts') =>
    form.getValues(name).filter((row) => {
      const minor = parseLocalizedMoneyMinor(row.amount, locale);
      return minor !== null && minor !== '0';
    }).length;
  const reviewPurchasePrice =
    formatLocalizedMoneyInput(form.getValues('purchasePrice'), locale) ??
    form.getValues('purchasePrice');

  useEffect(() => {
    void telemetry.track('calculation_step_viewed', {
      step_name: `step_${step}`,
      locale,
      is_offline: isOffline,
      source_screen: 'wizard',
    });
  }, [isOffline, locale, step]);

  useEffect(() => {
    const node = findNodeHandle(stepHeadingRef.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
    AccessibilityInfo.announceForAccessibility(
      t('accessibility.wizardStep', {
        current: step + 1,
        total: totalSteps,
        title: t(`wizard.steps.${step}.title`),
      }),
    );
  }, [step, t, totalSteps]);

  const flushDraft = useCallback(() => {
    if (!latestValues.current) return;
    if (timer.current) clearTimeout(timer.current);
    writeWizardDraft(settings, bundle.project.id, latestValues.current);
    form.reset(latestValues.current, { keepValues: true });
  }, [bundle.project.id, form, settings]);

  useEffect(() => {
    latestValues.current = values as WizardFormValues;
    if (!hasPendingAutosave) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flushDraft, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [flushDraft, hasPendingAutosave, values]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flushDraft();
    });
    return () => {
      flushDraft();
      subscription.remove();
    };
  }, [flushDraft]);

  usePreventRemove(hasPendingAutosave && !allowNavigation, ({ data }) => {
    Alert.alert(t('forms.unsavedTitle'), t('forms.unsavedBody'), [
      { text: t('forms.stay'), style: 'cancel' },
      {
        text: t('forms.leave'),
        style: 'destructive',
        onPress: () => {
          void telemetry.track('calculation_abandoned', {
            step_name: `step_${step}`,
            is_offline: isOffline,
            source_screen: 'wizard',
          });
          flushDraft();
          setAllowNavigation(true);
          setTimeout(() => navigation.dispatch(data.action), 0);
        },
      },
    ]);
  });

  const next = async () => {
    const fields = wizardStepFields[step] as readonly FieldPath<WizardFormValues>[];
    const valid = fields.length ? await form.trigger([...fields], { shouldFocus: true }) : true;
    if (!valid) {
      AccessibilityInfo.announceForAccessibility(t('forms.fixErrors'));
      return;
    }
    if (valid) {
      void telemetry.track('calculation_step_completed', {
        step_name: `step_${step}`,
        is_offline: isOffline,
        source_screen: 'wizard',
      });
      flushDraft();
      setStep((value) => Math.min(value + 1, totalSteps - 1));
    }
  };

  const calculate = form.handleSubmit(async (validValues) => {
    const nextBundle = formToProjectBundle(
      validValues,
      bundle,
      locale,
      { item: (key) => t(`costItems.${key}`, { defaultValue: key }) },
      energyProfile,
    );
    await saveBundle.mutateAsync(nextBundle);
    void telemetry.track('calculation_completed', {
      ownership_month_bucket: ownershipMonthBucket(nextBundle.project.ownershipMonths),
      locale,
      is_offline: isOffline,
      source_screen: 'wizard',
    });
    clearWizardDraft(settings, bundle.project.id);
    setAllowNavigation(true);
    setTimeout(() => router.replace(`/result/${bundle.project.id}` as Href), 0);
  });

  return (
    <Screen>
      <Stack.Screen options={{ title: t('wizard.title') }} />
      {isOffline ? <OfflineBanner message={t('offline.autosave')} /> : null}
      <StepIndicator
        currentStep={step + 1}
        label={t('accessibility.step', { current: step + 1, total: totalSteps })}
        totalSteps={totalSteps}
      />
      <View style={{ gap: theme.spacing.sm }}>
        <AppText ref={stepHeadingRef} accessibilityRole="header" variant="title">
          {t(`wizard.steps.${step}.title`)}
        </AppText>
        <AppText selectable tone="secondary">
          {t(`wizard.steps.${step}.body`)}
        </AppText>
        <AppText
          accessibilityLiveRegion="polite"
          variant="helper"
          tone={hasPendingAutosave ? 'warning' : 'success'}
        >
          {hasPendingAutosave ? t('wizard.autosavePending') : t('wizard.autosaveSaved')}
        </AppText>
      </View>

      {step === 0 ? (
        <View style={{ gap: theme.spacing.lg }}>
          <ControlledTextField
            control={form.control}
            label={t('wizard.fields.title')}
            name="title"
          />
          <ControlledNumberField
            control={form.control}
            helperText={t('wizard.help.ownership')}
            label={t('wizard.fields.ownershipMonths')}
            name="ownershipMonths"
          />
          <ControlledNumberField
            control={form.control}
            helperText={t(`wizard.usageFields.${usageUnit}.help`)}
            label={t(`wizard.usageFields.${usageUnit}.label`)}
            name="monthlyUsage"
          />
        </View>
      ) : null}
      {step === 1 ? (
        <View style={{ gap: theme.spacing.lg }}>
          <ControlledMoneyField
            control={form.control}
            currency={currency}
            helperText={t('wizard.help.purchase')}
            label={t('wizard.fields.purchasePrice')}
            name="purchasePrice"
          />
          <CostRowsEditor
            addLabel={t('wizard.costRows.addInitial')}
            body={t('wizard.costRows.initialBody')}
            control={form.control}
            currency={currency}
            name="initialCosts"
            title={t('wizard.costRows.initialTitle')}
          />
        </View>
      ) : null}
      {step === 2 ? (
        <View style={{ gap: theme.spacing.lg }}>
          <Controller
            control={form.control}
            name="financingEnabled"
            render={({ field }) => (
              <Card>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md }}>
                  <View style={{ flex: 1, gap: theme.spacing.xs }}>
                    <AppText variant="label">{t('wizard.fields.financingEnabled')}</AppText>
                    <AppText selectable variant="helper" tone="secondary">
                      {t('wizard.help.financing')}
                    </AppText>
                  </View>
                  <Switch
                    accessibilityLabel={t('wizard.fields.financingEnabled')}
                    onValueChange={field.onChange}
                    value={field.value}
                  />
                </View>
              </Card>
            )}
          />
          {values.financingEnabled ? (
            <>
              <ControlledMoneyField
                control={form.control}
                currency={currency}
                label={t('wizard.fields.financedAmount')}
                name="financedAmount"
              />
              <ControlledNumberField
                control={form.control}
                label={t('wizard.fields.annualInterestRate')}
                name="annualInterestRate"
              />
              <ControlledNumberField
                control={form.control}
                helperText={t('wizard.help.term')}
                label={t('wizard.fields.termMonths')}
                name="termMonths"
              />
              <ControlledMoneyField
                control={form.control}
                currency={currency}
                label={t('wizard.fields.loanFees')}
                name="loanFees"
              />
            </>
          ) : null}
        </View>
      ) : null}
      {step === 3 ? (
        <View style={{ gap: theme.spacing.lg }}>
          <CostRowsEditor
            addLabel={t('wizard.costRows.addRecurring')}
            body={t('wizard.costRows.recurringBody')}
            control={form.control}
            currency={currency}
            name="recurringCosts"
            title={t('wizard.costRows.recurringTitle')}
          />
          {energyProfile ? (
            <Card>
              <AppText accessibilityRole="header" variant="subtitle">
                {t(`wizard.energy.${energyProfile.kind}.title`)}
              </AppText>
              <ControlledNumberField
                control={form.control}
                helperText={t(`wizard.energy.${energyProfile.kind}.consumptionHelp`)}
                label={t(`wizard.energy.${energyProfile.kind}.consumption`)}
                name="energyConsumption"
              />
              <ControlledMoneyField
                control={form.control}
                currency={currency}
                label={t(`wizard.energy.${energyProfile.kind}.unitPrice`)}
                name="energyUnitPrice"
              />
            </Card>
          ) : null}
        </View>
      ) : null}
      {step === 4 ? (
        <View style={{ gap: theme.spacing.lg }}>
          <ControlledMoneyField
            control={form.control}
            currency={currency}
            helperText={t('wizard.help.residual')}
            label={t('wizard.fields.residualValue')}
            name="residualValue"
          />
          <ControlledMoneyField
            control={form.control}
            currency={currency}
            label={t('wizard.fields.sellingCosts')}
            name="sellingCosts"
          />
        </View>
      ) : null}
      {step === 5 ? (
        <View style={{ gap: theme.spacing.lg }}>
          <Card>
            <AppText variant="label">{t('wizard.assumptionsTitle')}</AppText>
            <AppText selectable tone="secondary">
              {t('wizard.assumptionsBody')}
            </AppText>
          </Card>
          <ControlledTextField
            control={form.control}
            helperText={t('wizard.help.notes')}
            label={t('wizard.fields.notes')}
            name="notes"
          />
        </View>
      ) : null}
      {step === 6 ? (
        <Card>
          <AppText variant="subtitle">{form.getValues('title')}</AppText>
          <AppText selectable>
            {t('wizard.review.purchase', { value: reviewPurchasePrice, currency })}
          </AppText>
          <AppText selectable>
            {t('wizard.review.duration', { value: form.getValues('ownershipMonths') })}
          </AppText>
          <AppText selectable>
            {t('wizard.review.usage', {
              value: form.getValues('monthlyUsage'),
              unit: t(`units.${usageUnit}`),
            })}
          </AppText>
          <AppText selectable>
            {t('wizard.review.initialCount', { count: countFilledRows('initialCosts') })}
          </AppText>
          <AppText selectable>
            {t('wizard.review.recurringCount', { count: countFilledRows('recurringCosts') })}
          </AppText>
          <AppText selectable>
            {t('wizard.review.financing', {
              value: form.getValues('financingEnabled') ? t('common.yes') : t('common.no'),
            })}
          </AppText>
        </Card>
      ) : null}

      {saveBundle.isError ? (
        <AppText accessibilityLiveRegion="assertive" tone="danger">
          {t('wizard.saveError')}
        </AppText>
      ) : null}
      <View style={{ gap: theme.spacing.sm }}>
        {step > 0 ? (
          <Button
            fullWidth
            label={t('common.back')}
            onPress={() => setStep((value) => value - 1)}
            variant="ghost"
          />
        ) : null}
        {step < totalSteps - 1 ? (
          <Button
            fullWidth
            label={t('common.continue')}
            onPress={() => void next()}
            testID="wizard-next"
          />
        ) : (
          <Button
            fullWidth
            label={t('wizard.calculate')}
            loading={saveBundle.isPending}
            onPress={() => void calculate()}
            testID="wizard-calculate"
          />
        )}
      </View>
    </Screen>
  );
}

export function CalculationWizardScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const project = useProject(id);
  const template = useTemplate(project.data?.project.templateId ?? '');

  if (project.isPending || (project.data && template.isPending)) {
    return (
      <Screen>
        <LoadingSkeleton accessibilityLabel={t('common.loading')} height={240} />
      </Screen>
    );
  }
  if (project.isError || !project.data) {
    return (
      <Screen>
        <ErrorState
          message={t('projects.notFoundBody')}
          onRetry={() => void project.refetch()}
          retryLabel={t('common.retry')}
          title={t('projects.notFoundTitle')}
        />
      </Screen>
    );
  }

  // A missing template is not fatal: saved cost lines are still editable without it.
  return <WizardForm bundle={project.data} template={template.data ?? null} />;
}
