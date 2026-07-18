import { zodResolver } from '@hookform/resolvers/zod';
import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { MoneyInput } from '@/components/ui/money-input';
import { NumberInput } from '@/components/ui/number-input';
import { useProject } from '@/data/query/project-hooks';
import { useReplaceScenarioOverrides, useScenarioOverrides } from '@/data/query/scenario-hooks';
import type { ProjectBundle, ScenarioOverrideRecord } from '@/data/repositories/types';
import { useSettings } from '@/features/settings/use-settings';
import { useTheme } from '@/hooks/use-theme';

import {
  createScenarioFormSchema,
  formToScenarioOverrides,
  getScenarioFields,
  scenarioToForm,
  type ScenarioFormValues,
} from './scenario-form';

function Editor({
  projectId,
  bundle,
  records,
}: {
  projectId: string;
  bundle: ProjectBundle;
  records: ScenarioOverrideRecord[];
}) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const router = useRouter();
  const theme = useTheme();
  const [scenario, setScenario] = useState<ScenarioOverrideRecord['scenario']>('low');
  const replace = useReplaceScenarioOverrides(projectId);
  const form = useForm<ScenarioFormValues>({
    defaultValues: scenarioToForm(bundle, records, 'low', locale),
    resolver: zodResolver(createScenarioFormSchema(locale)),
  });
  const fields = getScenarioFields(bundle);
  const chooseScenario = (next: ScenarioOverrideRecord['scenario']) => {
    setScenario(next);
    form.reset(scenarioToForm(bundle, records, next, locale));
  };
  const save = form.handleSubmit(async (values) => {
    await replace.mutateAsync({
      scenario,
      overrides: formToScenarioOverrides(bundle, values, scenario, locale),
    });
    form.reset(values);
  });

  return (
    <Screen>
      <Stack.Screen options={{ title: t('scenarios.editorTitle') }} />
      <AppText selectable tone="secondary">
        {t('scenarios.editorBody')}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <Chip
          label={t('scenarios.low')}
          onPress={() => chooseScenario('low')}
          selected={scenario === 'low'}
        />
        <Chip
          label={t('scenarios.base')}
          onPress={() => router.push(`/wizard/${projectId}` as Href)}
          selected={false}
        />
        <Chip
          label={t('scenarios.high')}
          onPress={() => chooseScenario('high')}
          selected={scenario === 'high'}
        />
      </View>
      <AppText selectable variant="helper" tone="secondary">
        {t('scenarios.baseEditHelp')}
      </AppText>
      {fields.map((definition) => (
        <Controller
          key={definition.key}
          control={form.control}
          name={definition.key}
          render={({ field, fieldState }) =>
            definition.kind === 'money' ? (
              <MoneyInput
                currency={bundle.project.currency}
                errorText={fieldState.error ? t('forms.invalidMoney') : undefined}
                label={t(definition.labelKey)}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
              />
            ) : (
              <NumberInput
                errorText={fieldState.error ? t('forms.invalidNumber') : undefined}
                label={t(definition.labelKey)}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
              />
            )
          }
        />
      ))}
      {replace.isError ? (
        <AppText accessibilityLiveRegion="assertive" tone="danger">
          {t('scenarios.saveError')}
        </AppText>
      ) : null}
      {replace.isSuccess && !form.formState.isDirty ? (
        <AppText accessibilityLiveRegion="polite" tone="success">
          {t('scenarios.saved')}
        </AppText>
      ) : null}
      <Button
        fullWidth
        label={t('scenarios.save')}
        loading={replace.isPending}
        onPress={() => void save()}
      />
    </Screen>
  );
}

export function ScenarioEditorScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const project = useProject(id);
  const overrides = useScenarioOverrides(id);

  if (project.isPending || overrides.isPending) {
    return (
      <Screen>
        <LoadingSkeleton accessibilityLabel={t('common.loading')} height={300} />
      </Screen>
    );
  }
  if (project.isError || overrides.isError || !project.data) {
    return (
      <Screen>
        <ErrorState
          message={t('scenarios.loadErrorBody')}
          onRetry={() => {
            void project.refetch();
            void overrides.refetch();
          }}
          retryLabel={t('common.retry')}
          title={t('scenarios.loadErrorTitle')}
        />
      </Screen>
    );
  }
  return <Editor bundle={project.data} projectId={id} records={overrides.data ?? []} />;
}
