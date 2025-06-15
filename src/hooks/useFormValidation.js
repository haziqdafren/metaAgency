import { useState } from 'react';

const useFormValidation = (initialState = {}, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSubmit = async (e, callback) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        try {
          await callback(values);
          setValues(initialState);
          setErrors({});
        } catch (error) {
          setErrors({ submit: error.message });
        }
      }
    } else {
      try {
        await callback(values);
        setValues(initialState);
        setErrors({});
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setValues(initialState);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  };
};

export default useFormValidation; 