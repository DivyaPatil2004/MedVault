package com.divyapatil.medvault.validation;

import com.divyapatil.medvault.dto.AppointmentSlotDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class SlotTimeRangeValidator implements ConstraintValidator<ValidSlotTimeRange, AppointmentSlotDto> {

    @Override
    public boolean isValid(AppointmentSlotDto dto, ConstraintValidatorContext context) {
        if (dto == null || dto.getStartTime() == null || dto.getEndTime() == null) {
            return true;
        }
        return dto.getEndTime().isAfter(dto.getStartTime());
    }
}
