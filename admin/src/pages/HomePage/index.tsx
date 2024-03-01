import { memo, useState } from "react";
import { useHistory } from "react-router-dom";
import pluginId from "../../pluginId";
import { useIntl } from "react-intl";
import getTrad from "../../utils/getTrad";
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
import { ContentLayout, HeaderLayout } from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";
import { Main } from "@strapi/design-system/Main";
import { Button } from "@strapi/design-system/Button";
import Cog from "@strapi/icons/Cog";

const HomePage = () => {
  const [isLoading] = useState(false);
  const { formatMessage } = useIntl();
  const { push } = useHistory();

  const configure = () => {
    push(`/settings/${pluginId}/`);
  };

  return (
    <Main labelledBy="title" aria-busy={isLoading}>
      <HeaderLayout
        id="title"
        title={formatMessage({ id: getTrad("plugin.homepage.title") })}
        secondaryAction={
          <Button variant="tertiary" onClick={configure} startIcon={<Cog />}>
            {formatMessage({ id: getTrad("plugin.help.settings") })}
          </Button>
        }
      ></HeaderLayout>
      <ContentLayout>
        {isLoading ? (
          <LoadingIndicatorPage />
        ) : (
          <Box
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            paddingTop={6}
            paddingBottom={6}
            paddingLeft={7}
            paddingRight={7}
          >
            <p className="paragraph paragraph--readable">
              {formatMessage({ id: getTrad("plugin.homepage.description") })}
            </p>

            <Button startIcon={<Cog />} onClick={configure}>
              {formatMessage({ id: getTrad("plugin.homepage.button") })}
            </Button>
          </Box>
        )}
      </ContentLayout>
    </Main>
  );
};

export default memo(HomePage);
