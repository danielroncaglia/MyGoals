import React from 'react'
import Editable from './Editable'
import { ProgressBar } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  FacebookShareButton,
  TwitterIcon,
  FacebookIcon
} from "react-share";

export default class ContentEditable extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      disabled: true
    }
    this.hasFocused = false
  }
  handleClick = (e) => {
    e.preventDefault()
    const event = e || window.event
    event.persist()
    if (!this.hasFocused) {
      const caretRange = getMouseEventCaretRange(event)
      window.setTimeout(() => {
        selectRange(caretRange)
        this.hasFocused = true
      }, 0)
    }
    this.setState({
      disabled: false
    })
  }
  handleClickOutside = (evt) => {
    const event = evt || window.event
    event.persist()
    const value = evt.target.value || evt.target.innerText
    this.setState({
      disabled: true
    }, () => {
      this.hasFocused = false
      if (this.props.onBlur) {
        this.props.onBlur(evt, value)
      }
    })
  }
  render() {
    const { onChange, children, html, editKey, tagName } = this.props
    const content = html || children

    return (

      <div>

        <Editable
          tagName={tagName}
          data-key={editKey}
          className={'editable'}
          onClick={this.handleClick}
          onBlur={this.handleClickOutside}
          html={content}
          disabled={this.state.disabled}
          onChange={onChange}
        />


        <ProgressBar now={60} />

        <FacebookShareButton url={"https://sharegoal.netlify.com/#/about"} >
          Share
        </FacebookShareButton >
        <TwitterIcon size={32} round={true} />

        <FacebookIcon />

      </div>
    )
  }
}

function getMouseEventCaretRange(event) {
  const x = event.clientX
  const y = event.clientY
  let range

  if (document.body.createTextRange) {
    range = document.body.createTextRange()
    range.moveToPoint(x, y)
  } else if (typeof document.createRange !== 'undefined') {
    if (typeof event.rangeParent !== 'undefined') {
      range = document.createRange()
      range.setStart(event.rangeParent, event.rangeOffset)
      range.collapse(true)
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y)
      range = document.createRange()
      range.setStart(pos.offsetNode, pos.offset)
      range.collapse(true)
    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y)
    }
  }
  return range
}

function selectRange(range) {
  if (range) {
    if (typeof range.select !== 'undefined') {
      range.select()
    } else if (typeof window.getSelection !== 'undefined') {
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }
}
