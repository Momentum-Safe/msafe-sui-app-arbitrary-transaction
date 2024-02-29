import { base } from '@msafe/msafe-ui';
import { Close } from '@mui/icons-material';
import { Alert, IconButton } from '@mui/material';
import { CustomContentProps, SnackbarContent, useSnackbar } from 'notistack';
import { forwardRef } from 'react';

const AppToast = forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const { id, message, variant } = props;

  const { closeSnackbar } = useSnackbar();

  return (
    <SnackbarContent ref={ref}>
      <Alert
        severity={variant === 'default' ? 'info' : variant}
        variant="filled"
        sx={{ width: '100%' }}
        action={
          <IconButton size="small" onClick={() => closeSnackbar(id)}>
            <Close sx={{ fontSize: 16, color: base.white }} />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </SnackbarContent>
  );
});

export default AppToast;
