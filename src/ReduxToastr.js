import React,
  {Component, PropTypes}    from 'react';
import {connect}            from 'react-redux';
import {bindActionCreators} from 'redux';
import classnames           from 'classnames';

import ToastrBox            from './ToastrBox';
import ToastrConfirm        from './ToastrConfirm';
import * as tActions        from './actions';
import {EE}                 from './toastrEmitter';
import config               from './config';

import {checkPositionName, isMobile, _bind}  from './utils.js';

const mapStateToProps = (state) => ({
  toastr: state.toastr
});

export class ReduxToastr extends Component {
  static displayName = 'ReduxToastr'

  static propTypes = {
    toastr: PropTypes.object,
    options: PropTypes.object,
    position: PropTypes.string,
    newestOnTop: PropTypes.bool,
    timeOut: PropTypes.number
  }

  static defaultProps = {
    position: 'top-right',
    newestOnTop: true
  }

  constructor(props) {
    super(props);
    this.actions = bindActionCreators(tActions, this.props.dispatch);
    config.set('newestOnTop', this.props.newestOnTop);

    _bind(
      this,
      'handleRemoveToastr',
      'handleHideConfirm'
    );
  }

  componentDidMount() {
    const onAddToastr = (toastr) => {
      this.actions.addToastrAction(toastr);
    };

    const onCleanToastr = () => {
      if (this.props.toastr.toastrs.length) {
        this.actions.clean();
      }
    };
    const confirm = (obj) => {
      this.actions.confirm(obj.message, obj.options);
    };

    EE.on('toastr/confirm', confirm);
    EE.on('add/toastr', onAddToastr);
    EE.on('clean/toastr', onCleanToastr);
  }

  componentWillUnmount() {
    EE.removeListener('toastr/confirm');
    EE.removeListener('add/toastr');
    EE.removeListener('clean/toastr');
  }

  handleRemoveToastr(id) {
    this.actions.remove(id);
  }

  handleHideConfirm() {
    this.actions.hideConfirm();
  }

  render() {
    const toastrPosition = checkPositionName(this.props.position);
    const classes = classnames('redux-toastr', toastrPosition, {mobile: isMobile});

    return (
      <div className={classes}>
        <ToastrConfirm
          hideConfirm={this.handleHideConfirm}
          confirm={this.props.toastr.confirm}/>
        {this.props.toastr.toastrs.map((toastr) => {
          return (
            <ToastrBox
              key={toastr.id}
              toastr={toastr}
              timeOut={this.props.timeOut}
              remove={this.handleRemoveToastr}/>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps)(ReduxToastr);