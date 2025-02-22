
import React from 'react'

export default class Editable extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      !this.htmlEl
      || (nextProps.html !== this.htmlEl.innerHTML
        && nextProps.html !== this.props.html)
       || this.props.disabled !== nextProps.disabled
    )
  }
  componentDidUpdate() {
    if (this.htmlEl && this.props.html !== this.htmlEl.innerHTML) {
       this.htmlEl.innerHTML = this.props.html
    }
  }
  preventEnter = (evt) => {
    if (evt.which === 13) {
      evt.preventDefault()
      if (!this.htmlEl) {
        return false
      }
      this.htmlEl.blur()
      return false
    }
  }
  emitChange = (evt) => {
    if (!this.htmlEl) {
      return false
    }
    const html = this.htmlEl.innerHTML
    if (this.props.onChange && html !== this.lastHtml) {
      evt.target.value = html
      this.props.onChange(evt, html)
    }
    this.lastHtml = html
  }
  render() {
    const { tagName, html, onChange, ...props } = this.props

    const domNodeType = tagName || 'div'
    const elementProps = {
      ...props,
      ref: (e) => this.htmlEl = e,
      onKeyDown: this.preventEnter,
      onInput: this.emitChange,
      onBlur: this.props.onBlur || this.emitChange,
      contentEditable: !this.props.disabled,
    }

    let children = this.props.children
    if (html) {
      elementProps.dangerouslySetInnerHTML = { __html: html }
      children = null
    }
    return React.createElement(domNodeType, elementProps, children)
  }
}
