import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router'

import ArticleContent from '../articles/components/ArticleContent'
import ArticleHeader from '../articles/components/ArticleHeader'
import ArticleMenu from '../articles/components/ArticleMenu'
import { Article } from '../articles/models'
import ButtonIcon from '../common/ButtonIcon'
import { matchResponse } from '../common/helpers'
import Loader from '../common/Loader'
import Page from '../common/Page'
import Panel from '../common/Panel'
import { connectOffline, OfflineProps } from '../containers/OfflineContainer'
import ErrorPanel from '../error/ErrorPanel'

type AllProps = RouteComponentProps<{ id: string }> & OfflineProps

export const OfflineArticlePage = ({ match, offlineArticles, fetchOfflineArticle }: AllProps) => {
  const { id } = match.params

  const { selected: data, error, loading } = offlineArticles

  useEffect(() => {
    fetchOfflineArticle(parseInt(id, 10))
  }, [])

  const render = matchResponse<Article>({
    Loading: () => <Loader />,
    Error: err => <ErrorPanel>{err.message}</ErrorPanel>,
    Data: article => {
      if (article) {
        article.isOffline = true
        return (
          <>
            <ArticleHeader article={article}>
              <ArticleMenu article={article} />
            </ArticleHeader>
            <ArticleContent article={article} />
          </>
        )
      }
      return <ErrorPanel title="Not found">Article #{id} not found.</ErrorPanel>
    },
    Other: () => <Loader />
  })

  return (
    <Page
      title="Offline articles"
      subtitle={data && data.title}
      actions={<ButtonIcon to="/offline" icon="arrow_back" title="back to the list" />}
    >
      <Panel style={{ flex: '1 1 auto' }}>{render(data, error, loading)}</Panel>
    </Page>
  )
}

export default connectOffline(OfflineArticlePage)
