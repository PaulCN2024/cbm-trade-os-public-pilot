# Inquiry Intelligence Missing Information Rules

## Purpose

This document defines planning rules for detecting missing information in customer inquiries before quotation, supplier confirmation, or customer reply.

These rules are advisory. They do not block records automatically, mutate inquiries, send messages, create RFQs, or create quotations.

## Common Missing Information Categories

### A. Product Specification

- model/profile type
- dimensions
- thickness
- material
- surface treatment
- color
- standard/code
- drawing/photo

### B. Quantity And Packing

- quantity by item
- total quantity
- unit
- packing
- loading plan
- container type
- label/private brand

### C. Project And Logistics

- project location
- delivery port
- timeline
- installation responsibility
- site measurement responsibility

### D. Commercial

- target price
- payment terms
- buyer role
- decision maker
- end user / contractor / distributor

## Required-level Definitions

- `required`: needed before formal quotation, supplier RFQ, or reliable customer reply.
- `recommended`: useful for reducing assumptions, price risk, logistics risk, or production uncertainty.
- `optional`: helpful context, but not usually required for the first review pass.

## Status Definitions

- `confirmed`: available and usable.
- `missing`: not available and should be requested or confirmed.
- `needs_review`: available but ambiguous, conflicting, or risky.
- `supplier_confirm`: requires supplier or factory confirmation.
- `not_required`: not needed for this product/inquiry type.

## Product-specific Examples

### Light Steel Keel / Drywall Profile

Likely required:

- profile type
- thickness
- width/height/dimensions
- material or steel grade
- surface treatment/coating
- quantity and length
- packing or bundle expectation
- destination port if freight is discussed

### Aluminum Window/Door

Likely required:

- system/profile series
- drawing or photo
- dimensions
- glass configuration
- color/surface treatment
- hardware requirements
- quantity by size
- project location and installation responsibility

### Ceiling System

Likely required:

- ceiling type
- size/specification
- thickness/material
- surface finish
- quantity or area
- accessories requirement
- packing and loading expectation

### Glass/Accessories

Likely required:

- glass type or accessory model
- size/specification
- thickness
- quantity
- finish/color if applicable
- packaging requirement
- safety standard if applicable

### Facade System

Likely required:

- drawing
- system type
- material specification
- panel/glass details
- wind/load/design standard if relevant
- project location
- scope responsibility
- supplier/factory feasibility confirmation

## Rule Examples

- If product is steel profile and thickness is missing, formal quote is blocked.
- If drawing is missing for custom aluminum or facade work, supplier confirmation is needed.
- If quantity split is missing, weight/loading calculation is blocked.
- If target port is missing, FOB/CIF estimate is incomplete.
- If buyer role is unclear, ask before sensitive pricing.

## Safety Boundary

Missing information rules may recommend questions or highlight blockers. They must not:

- send a customer message
- create a supplier RFQ
- create a quotation
- confirm price
- confirm delivery time
- mutate customer or inquiry records
- trigger PI, order, payment, production, or shipment actions
