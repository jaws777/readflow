import React from 'react'
import { useApolloClient } from 'react-apollo-hooks'
import { useModal } from 'react-modal-hook'

import ConfirmDialog from '../../common/ConfirmDialog'
import Kbd from '../../common/Kbd'
import LinkIcon from '../../common/LinkIcon'
import { connectMessageDispatch, IMessageDispatchProps } from '../../containers/MessageContainer'
import { connectOfflineDispatch, IOfflineDispatchProps } from '../../containers/OfflineContainer'
import { Article, GetArticleResponse } from '../models'
import { GetFullArticle } from '../queries'

interface Props {
  article: Article
  keyboard?: boolean
}

type AllProps = Props & IMessageDispatchProps & IOfflineDispatchProps

export const OfflineLink = (props: AllProps) => {
  const { article, keyboard = false, saveOfflineArticle, removeOfflineArticle, showMessage } = props

  const client = useApolloClient()

  const putArticleOffline = async () => {
    try {
      const { errors, data } = await client.query<GetArticleResponse>({
        query: GetFullArticle,
        variables: { id: article.id }
      })
      if (data) {
        const fullArticle = { ...article, ...data.article }
        await saveOfflineArticle(fullArticle)
        showMessage(`Article put offline: ${article.title}`)
      }
      if (errors) {
        throw new Error(errors[0])
      }
    } catch (err) {
      showMessage(err.message, true)
    }
  }

  const removeArticleOffline = async () => {
    try {
      await removeOfflineArticle(article)
      showMessage(`Article removed from offline storage: ${article.title}`)
    } catch (err) {
      showMessage(err.message, true)
    }
  }

  const [showDeleteConfirmModal, hideDeleteConfirmModal] = useModal(() => (
    <ConfirmDialog
      title={article.title}
      confirmLabel="Remove"
      onConfirm={() => removeArticleOffline()}
      onCancel={hideDeleteConfirmModal}
    >
      Removing an article from offline storage is irreversible. Please confirm!
    </ConfirmDialog>
  ))

  if (article.isOffline) {
    return (
      <LinkIcon title="Remove" onClick={showDeleteConfirmModal} icon="delete">
        <span>Remove offline</span>
        {keyboard && <Kbd keys="r" onKeypress={showDeleteConfirmModal} />}
      </LinkIcon>
    )
  }

  return (
    <LinkIcon title="Put offline" onClick={putArticleOffline} icon="signal_wifi_off">
      <span>Put offline</span>
      {keyboard && <Kbd keys="o" onKeypress={putArticleOffline} />}
    </LinkIcon>
  )
}

export default connectOfflineDispatch(connectMessageDispatch(OfflineLink))
