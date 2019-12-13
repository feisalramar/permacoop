import {Dispatch} from 'redux';
import {loading, errors, success} from '../../core/actions/upsert';
import {errorNormalizer} from '../../../normalizer/errors';
import {saveCustomer} from '../repositories/customer';
import {CustomerFormData} from '../components/form/CustomerForm';

export const upsertCustomer = (
  payload: CustomerFormData,
  id?: string
) => async (dispatch: Dispatch): Promise<void> => {
  dispatch(loading(true));

  try {
    dispatch(success(await saveCustomer(payload, id)));
  } catch (e) {
    dispatch(errors(errorNormalizer(e)));
  } finally {
    dispatch(loading(false));
  }
};
