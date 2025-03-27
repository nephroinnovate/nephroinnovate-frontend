// project imports
import componentsOverrides from './overrides';

export default function componentStyleOverrides(theme, borderRadius, outlinedFilled) {
  const mode = theme.palette.mode;
  const bgColor = mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50];
  const menuSelectedBack = mode === 'dark' ? theme.palette.action?.selected : theme.palette.secondary.light;
  const menuSelected = mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.dark;

  const darkModeStyles = mode === 'dark' ? {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#242b38'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#242b38',
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#242b38',
          borderRadius: 8
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a3142',
          color: theme.palette.text.primary
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          '&.MuiTableCell-head': {
            backgroundColor: '#2a3142',
            color: '#ffffff',
            fontWeight: 600
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#1f2531'
          },
          '&:hover': {
            backgroundColor: '#2a3142'
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#242b38'
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#242b38'
        }
      }
    },
    Paper: {
      styleOverrides: {
        root: {
          backgroundColor: '#242b38'
        }
      }
    }
  } : {};

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '8px',
          boxShadow: theme.shadows[2],
          textTransform: 'none',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: theme.palette.primary.dark
          }
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark
          }
        },
        containedError: {
          '&:hover': {
            backgroundColor: theme.palette.error.dark
          }
        },
        outlinedPrimary: {
          borderWidth: 1.5
        },
        outlinedSecondary: {
          borderWidth: 1.5
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '& + .MuiFormControlLabel-label': {
            marginTop: 2
          },
          color: theme.palette.primary.main,
          '&.Mui-checked': {
            color: theme.palette.primary.main
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: theme.shadows[4],
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[8],
          }
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8
        },
        rounded: {
          borderRadius: `${borderRadius}px`
        },
        elevation1: {
          boxShadow: theme.shadows[1]
        },
        elevation2: {
          boxShadow: theme.shadows[2]
        },
        elevation3: {
          boxShadow: theme.shadows[3]
        },
        elevation4: {
          boxShadow: theme.shadows[4]
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '24px'
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 600
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px'
        }
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '24px'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          alignItems: 'center',
          boxShadow: theme.shadows[3],
          borderRadius: 8,
          '& .MuiAlert-icon': {
            fontSize: '1.5rem'
          }
        },
        outlined: {
          border: '1px dashed'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
          paddingTop: '10px',
          paddingBottom: '10px',
          '&.Mui-selected': {
            color: menuSelected,
            backgroundColor: menuSelectedBack,
            '&:hover': {
              backgroundColor: menuSelectedBack
            },
            '& .MuiListItemIcon-root': {
              color: menuSelected
            }
          },
          '&:hover': {
            backgroundColor: menuSelectedBack,
            color: menuSelected,
            '& .MuiListItemIcon-root': {
              color: menuSelected
            }
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
          minWidth: '36px'
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.dark,
          fontWeight: 500
        },
        secondary: {
          color: mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.secondary
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: theme.palette.text.dark,
          '&::placeholder': {
            color: theme.palette.text.secondary,
            fontSize: '0.875rem'
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: outlinedFilled ? bgColor : 'transparent',
          borderRadius: `${borderRadius}px`,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[400]
          },
          '&:hover $notchedOutline': {
            borderColor: theme.palette.primary.light
          },
          '&.MuiInputBase-multiline': {
            padding: 1
          }
        },
        input: {
          fontWeight: 500,
          background: outlinedFilled ? bgColor : 'transparent',
          padding: '15.5px 14px',
          borderRadius: `${borderRadius}px`,
          '&.MuiInputBase-inputSizeSmall': {
            padding: '10px 14px',
            '&.MuiInputBase-inputAdornedStart': {
              paddingLeft: 0
            }
          }
        },
        inputAdornedStart: {
          paddingLeft: 4
        },
        notchedOutline: {
          borderRadius: `${borderRadius}px`
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            color: theme.palette.grey[300]
          }
        },
        mark: {
          backgroundColor: theme.palette.background.paper,
          width: '4px'
        },
        valueLabel: {
          color: theme.palette.primary.light
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiAutocomplete-tag': {
            background: theme.palette.secondary.light,
            borderRadius: 4,
            color: theme.palette.text.dark,
            '.MuiChip-deleteIcon': {
              color: theme.palette.secondary[200]
            }
          }
        },
        popper: {
          borderRadius: `${borderRadius}px`,
          boxShadow: '0px 8px 10px -5px rgb(0 0 0 / 20%), 0px 16px 24px 2px rgb(0 0 0 / 14%), 0px 6px 30px 5px rgb(0 0 0 / 12%)'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.divider
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          color: theme.palette.primary.dark,
          background: theme.palette.primary[200]
        }
      }
    },
    MuiTimelineContent: {
      styleOverrides: {
        root: {
          color: theme.palette.text.dark,
          fontSize: '16px'
        }
      }
    },
    MuiTreeItem: {
      styleOverrides: {
        label: {
          marginTop: 14,
          marginBottom: 14
        }
      }
    },
    MuiTimelineDot: {
      styleOverrides: {
        root: {
          boxShadow: 'none'
        }
      }
    },
    MuiInternalDateTimePickerTabs: {
      styleOverrides: {
        tabs: {
          backgroundColor: theme.palette.primary.light,
          '& .MuiTabs-flexContainer': {
            borderColor: theme.palette.primary[200]
          },
          '& .MuiTab-root': {
            color: theme.palette.text.dark
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.dark
          },
          '& .Mui-selected': {
            color: theme.palette.primary.dark
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          borderBottom: '1px solid',
          borderColor: theme.palette.grey[200]
        },
        indicator: {
          height: 3,
          borderRadius: 1.5
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 64,
          fontWeight: 600,
          '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 700
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: '12px 0 12px 0',
          backgroundColor: mode === 'dark' ? '#242b38' : theme.palette.background.paper,
          borderRadius: 8,
          boxShadow: theme.shadows[10]
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#242b38' : 'inherit',
          borderRadius: 4,
          boxShadow: theme.shadows[4],
          overflow: 'hidden'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.palette.grey[200],
          '&.MuiTableCell-head': {
            fontSize: '0.875rem',
            color: mode === 'dark' ? theme.palette.text.primary : theme.palette.grey[900],
            fontWeight: 700,
            backgroundColor: mode === 'dark' ? '#2a3142' : theme.palette.primary.light,
            padding: '16px 12px'
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: mode === 'dark' ? '#1f2531' : theme.palette.action.hover
          },
          '&:hover': {
            backgroundColor: mode === 'dark' ? '#2a3142' : theme.palette.action.selected
          }
        }
      }
    },
    MuiDateTimePickerToolbar: {
      styleOverrides: {
        timeDigitsContainer: {
          alignItems: 'center'
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          margin: 0,
          lineHeight: 1.4,
          color: theme.palette.background.paper,
          background: theme.palette.text.primary
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          backgroundColor: mode === 'dark' ? '#2a3142' : theme.palette.primary.light,
          color: mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.dark,
          padding: '16px 24px',
          fontWeight: 700
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px'
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          backgroundColor: mode === 'dark' ? '#2a3142' : '#f5f5f5'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.1)'
          }
        },
        colorPrimary: {
          '&:hover': {
            backgroundColor: theme.palette.primary.lighter
          }
        },
        colorSecondary: {
          '&:hover': {
            backgroundColor: theme.palette.secondary.lighter
          }
        },
        colorError: {
          '&:hover': {
            backgroundColor: theme.palette.error.lighter
          }
        },
        colorInfo: {
          '&:hover': {
            backgroundColor: theme.palette.info.lighter
          }
        }
      }
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          margin: '3px'
        }
      }
    },
    MuiDataGrid: {
      defaultProps: {
        rowHeight: 54
      },
      styleOverrides: {
        root: {
          borderWidth: 0,
          '& .MuiDataGrid-columnHeader--filledGroup': {
            borderBottomWidth: 0
          },
          '& .MuiDataGrid-columnHeader--emptyGroup': {
            borderBottomWidth: 0
          },
          '& .MuiFormControl-root>.MuiInputBase-root': {
            backgroundColor: `${theme.palette.background.default} !important`,
            borderColor: `${theme.palette.divider} !important`
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: mode === 'dark' ? '#2a3142' : 'inherit',
            borderBottomColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.palette.divider
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: mode === 'dark' ? '#2a3142' : 'inherit',
            borderTopColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.palette.divider
          },
          '& .MuiTablePagination-root': {
            color: mode === 'dark' ? '#ffffff' : 'inherit'
          }
        },
        withBorderColor: {
          borderColor: theme.palette.divider
        },
        toolbarContainer: {
          '& .MuiButton-root': {
            paddingLeft: '16px !important',
            paddingRight: '16px !important'
          }
        },
        columnHeader: {
          color: theme.palette.grey[600],
          paddingLeft: 24,
          paddingRight: 24
        },
        footerContainer: {
          '&.MuiDataGrid-withBorderColor': {
            borderBottom: 'none'
          }
        },
        columnHeaderCheckbox: {
          paddingLeft: 0,
          paddingRight: 0
        },
        cellCheckbox: {
          paddingLeft: 0,
          paddingRight: 0
        },
        cell: {
          borderWidth: 1,
          paddingLeft: 24,
          paddingRight: 24,
          borderColor: theme.palette.divider,
          '&.MuiDataGrid-cell--withRenderer > div ': {
            ' > .high': {
              background: theme.palette.success.light
            },
            '& > .medium': {
              background: theme.palette.warning.light
            },
            '& > .low': {
              background: theme.palette.error.light
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#242b38' : theme.palette.background.paper
        }
      }
    },
    ...darkModeStyles,
    ...componentsOverrides(theme)
  };
}
