import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { compose, pure } from 'recompose';
import injectSheet from 'react-jss';
import { withRouter } from 'react-router-dom';
import { historyShape } from '../../utils/propTypes';

const styles = theme => ({
  container: {
    height: 'calc(100vh - 64px - 69px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    margin: `0 ${theme.marginSmall}px 0px ${theme.marginSmall}px`,
    fontSize: 'x-large',
  },
  button: {
    margin: `0 ${theme.marginSmall}px 0px ${theme.marginSmall}px`,
  },
});

const NotFound = ({ classes, history }) => (
  <div className={classes.container}>
    <div className={classes.text}>
      找不到網頁
    </div>
    <div>
      <Button
        className={classes.button}
        type="primary"
        size="large"
        shape="circle"
        icon="arrow-left"
        onClick={() => { history.goBack(); }}
      />
      <Button
        className={classes.button}
        type="primary"
        size="large"
        shape="circle"
        icon="home"
        onClick={() => { history.push('/'); }}
      />
    </div>
  </div>
);
NotFound.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  history: historyShape.isRequired,
};

const enhance = compose(
  injectSheet(styles),
  withRouter,
  pure,
);

export default enhance(NotFound);
