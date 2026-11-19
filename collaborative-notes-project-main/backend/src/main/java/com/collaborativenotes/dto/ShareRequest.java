package com.collaborativenotes.dto;
import lombok.Data;
@Data
public class ShareRequest {
    private String email;
    private String permission; // VIEW or EDIT
}