import React, { useRef, useEffect, useState } from "react";
//I18N
import { useIntl, FormattedMessage } from "react-intl";
import getTrad from "../../utils/getTrad";
//Strapi Design-System components
import Check from "@strapi/icons/Check";
import Key from "@strapi/icons/Key";
import {
  Grid,
  GridItem,
  HeaderLayout,
  Button,
  ToggleInput,
  Divider,
  Box,
  ContentLayout,
  Stack,
  Main,
  Alert,
  SingleSelect,
  SingleSelectOption,
} from "@strapi/design-system";
import { TextInput } from "@strapi/design-system";

// From Strapi helper
import { LoadingIndicatorPage, useNotification } from "@strapi/helper-plugin";
//Proxy
import SettingsProxy from "../../api/settings-proxy";
import { ISettings } from "../../../../types";
import { languageObject } from "../../data/languages";

const Settings = () => {
  const { formatMessage } = useIntl();
  const isMounted = useRef(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [settings, setSettings] = useState<ISettings>({
    createAltTextOnImageUpload: false,
    apiKey: "",
    language: "en",
  });
  const toggleNotification = useNotification();

  //mount
  useEffect(() => {
    SettingsProxy.get().then((data: ISettings) => {
      setSettings(data);
      setIsLoading(false);
    });
    // unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    const data: ISettings = await SettingsProxy.set(settings);
    setSettings(data);
    setIsDirty(false);
    setIsSaving(false);
    toggleNotification({
      type: "success",
      message: { id: getTrad("plugin.settings.button.save.message") },
    });
  };

  return (
    <>
      <Main labelledBy="title" aria-busy={isLoading}>
        <HeaderLayout
          id="title"
          title={formatMessage({ id: getTrad("plugin.settings.title") })}
          subtitle={formatMessage(
            { id: getTrad("plugin.settings.version") },
            { version: 1.0 }
          )}
          primaryAction={
            isLoading ? (
              <></>
            ) : (
              <Button
                onClick={handleSubmit}
                startIcon={<Check />}
                size="L"
                disabled={isSaving}
                loading={isSaving}
              >
                {formatMessage({
                  id: getTrad("plugin.settings.button.save.label"),
                })}
              </Button>
            )
          }
        ></HeaderLayout>
        {isLoading ? (
          <LoadingIndicatorPage />
        ) : (
          <ContentLayout>
            <form onSubmit={handleSubmit}>
              <Box
                background="neutral0"
                hasRadius
                shadow="filterShadow"
                paddingTop={6}
                paddingBottom={6}
                paddingLeft={7}
                paddingRight={7}
              >
                <Stack size={8}>
                  <h2 className="heading">
                    {formatMessage({
                      id: getTrad("plugin.settings.general.title"),
                    })}
                  </h2>

                  <p>
                    <FormattedMessage
                      id={getTrad("plugin.settings.description")}
                      values={{
                        link: (
                          <a
                            className="link"
                            target="_blank"
                            href="https://www.alttextautomator.com/auth/sign-up"
                          >
                            <FormattedMessage
                              id={getTrad(
                                "plugin.settings.description.link.home"
                              )}
                            />
                          </a>
                        ),
                        settingsLink: (
                          <a
                            className="link"
                            target="_blank"
                            href="https://www.alttextautomator.com/settings/api-keys"
                          >
                            <FormattedMessage
                              id={getTrad(
                                "plugin.settings.description.link.settings"
                              )}
                            />
                          </a>
                        ),
                      }}
                    />
                  </p>
                  <Divider></Divider>
                  <Grid gap={5}>
                    <GridItem col={12}>
                      <Stack gap={4}>
                        {!isDirty &&
                          settings?.apiKey &&
                          !settings?.isValidApiKey && (
                            <Alert variant="danger">
                              Your API key couldn't be validated. Make sure it
                              exists with Alt Text Automator settings
                            </Alert>
                          )}

                        <TextInput
                          label={formatMessage({
                            id: getTrad("plugin.settings.apiKey.label"),
                          })}
                          name="apiKey"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setIsDirty(true);
                            setSettings({
                              ...settings,
                              apiKey: e.target.value,
                            });
                          }}
                          value={settings?.apiKey}
                          labelAction={<Key aria-hidden />}
                        />

                        {settings?.isValidApiKey && (
                          <Alert title="credits">
                            Your API key is valid. You have{" "}
                            {settings?.credits ?? 0} credits left.
                          </Alert>
                        )}
                      </Stack>
                    </GridItem>
                    <GridItem col={12} s={12}>
                      <ToggleInput
                        hint={formatMessage({
                          id: getTrad("plugin.settings.enabled.hint"),
                        })}
                        checked={settings?.createAltTextOnImageUpload ?? false}
                        label={formatMessage({
                          id: getTrad("plugin.settings.enabled"),
                        })}
                        name="moduleEnabled"
                        offLabel={formatMessage({
                          id: "app.components.ToggleCheckbox.off-label",
                          defaultMessage: "Off",
                        })}
                        onLabel={formatMessage({
                          id: "app.components.ToggleCheckbox.on-label",
                          defaultMessage: "On",
                        })}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setIsDirty(true);
                          setSettings({
                            ...settings,
                            createAltTextOnImageUpload: e.target.checked,
                          });
                        }}
                      />
                    </GridItem>
                    <GridItem col={12} s={12}>
                      <SingleSelect
                        value={settings?.language ?? "en"}
                        onChange={(value: string) => {
                          setIsDirty(true);
                          setSettings({
                            ...settings,
                            language: value,
                          });
                        }}
                        label={formatMessage({
                          id: getTrad("plugin.settings.language.label"),
                        })}
                        required
                        hint={formatMessage({
                          id: getTrad("plugin.settings.language.hint"),
                        })}
                      >
                        {Object.entries(languageObject).map(
                          ([value, label]) => (
                            <SingleSelectOption key={value} value={value}>
                              {label}
                            </SingleSelectOption>
                          )
                        )}
                      </SingleSelect>
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>
            </form>
          </ContentLayout>
        )}
      </Main>
    </>
  );
};

export default Settings;
