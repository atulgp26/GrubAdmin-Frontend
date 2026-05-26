"use client";
import Button from "@/components/ui/Button";
import FullPageModal from "@/components/ui/FullPageModal";
import Input from "@/components/ui/Input";
import MobileNumberInput from "@/components/ui/MobileNumberInput";
import Select from "@/components/ui/Select";
import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { customerService } from "@/api/services/customerService";
import { showError, showSuccess } from "@/components/ui/toast";
import { CAMPING_VERTICAL_NAME } from "@/constants/config";
import { Country, State } from "country-state-city";

const AddNewClient = ({
	open,
	onClose,
	onConfirm = (data) => {},
	isCreating = false,
}) => {
	const [form, setForm] = useState({
		fullName: "",
		clientId: "",
		phone: "",
		email: "",
		country: "",
		state: "",
		vertical: "",
		orgName: "",
	});
	const [verticalOptions, setVerticalOptions] = useState([]);
	const [focusedField, setFocusedField] = useState("");
	const [isFormValid, setIsFormValid] = useState(false);
	const [campingVerticalId, setCampingVerticalId] = useState(null);
	const [countryOptions, setCountryOptions] = useState([]);
	const [selectedIso, setSelectedIso] = useState("");

	const isOrganizationDisabled = useMemo(() => {
		return form.vertical === campingVerticalId;
	}, [form]);

	const stateOptions = useMemo(() => {
		if (selectedIso) {
			const states = State.getStatesOfCountry(selectedIso);

			return states.map((s) => ({
				label: s.name,
				value: s.name,
			}));
		}

		return [];
	}, [selectedIso]);

	useEffect(() => {
		console.log(form.country);
	}, [form.country]);

	// const countryOptions = [
	// 	{ value: "in", label: "India" },
	// 	{ value: "us", label: "USA" },
	// 	{ value: "uk", label: "UK" },
	// ];
	// const stateOptions = [
	// 	{ value: "ka", label: "Karnataka" },
	// 	{ value: "mh", label: "Maharashtra" },
	// ];

	// const verticalOptions = [
	//     { value: "hospitality", label: "Hospitality" },
	//     { value: "camping", label: "Camping" },
	//     { value: "delivery", label: "Delivery" },
	//     { value: "medical", label: "Medical" },
	// ];
	const handleFocus = (field) => setFocusedField(field);
	const handleBlur = () => setFocusedField("");
	const handleChange = (field, value) => {
		console.log(field, value);
		if (field === "country") {
			setSelectedIso(value);
			setForm((prev) => ({ ...prev, [field]: value }));
		} else {
			setForm((prev) => ({ ...prev, [field]: value }));
		}
	};

	const fetchVerticals = async () => {
		const verticalsResponse = await customerService.getVerticals();

		if (
			verticalsResponse.success &&
			verticalsResponse.code === 200 &&
			verticalsResponse.data.verticals
		) {
			setVerticalOptions(
				verticalsResponse.data.verticals.map((v) => ({
					label: v.name,
					value: v.id,
				})),
			);

			for (const v of verticalsResponse.data.verticals) {
				if (v.name === CAMPING_VERTICAL_NAME) {
					setCampingVerticalId(v.id);
				}
			}
		} else if (!verticalsResponse.success) {
			showError(verticalsResponse.error ?? "Something went wrong");
		} else {
			showError("Something went wrong");
		}
	};

	const fetchCountries = async () => {
		const countries = Country.getAllCountries();

		setCountryOptions(() =>
			countries.map((c) => ({
				label: c.name,
				value: c.isoCode,
			})),
		);
	};

	// Form validation check
	useEffect(() => {
		let isFormValid = true;

		for (const key of Object.keys(form)) {
			if (key === "orgName") continue;
			if (form[key] === "" || form[key] == null) {
				isFormValid = false;
				break;
			}
		}

		setIsFormValid(isFormValid);
	}, [form]);

	useEffect(() => {
		if (open) {
			fetchVerticals();
			fetchCountries();
		} else {
			setForm({
				fullName: "",
				clientId: "",
				phone: "",
				email: "",
				country: "",
				state: "",
				vertical: "",
				orgName: "",
			});
			setSelectedIso("");
			setCountryOptions([]);
		}
	}, [open]);

	const handleSave = async () => {
		if (!isFormValid) return;

		const country = Country.getCountryByCode(form.country);

		const data = {
			...form,
			name: form.fullName,
			country: country.name,
			client_id: form.clientId,
			country_code: form.phone.slice(0, 3),
			mobile_number: form.phone.slice(3),
			organization_name: form.orgName ? form.orgName : undefined,
			vertical_id: form.vertical,
		};

		console.log(data);

		console.log("Saving client:", data);

	const result = await onConfirm(data);

if (result?.error) {
    showError(result.error);
    return;
}


		showSuccess("Success", result?.message);

	setForm({ fullName: "", clientId: "", phone: "", email: "", country: "", state: "", vertical: "", orgName: "" });
setSelectedIso("");
setCountryOptions([]);
onClose();
	};
	return (
		<FullPageModal open={open} onClose={onClose}>
			<div className="h-screen bg-white flex flex-col">
				{/* Header */}
				<div className="flex-shrink-0">
					<div className="w-full py-4">
						<Button
							variant="grayOutline"
							className="flex gap-2 mx-3 w-fit items-center btn-size-md-sm"
							onClick={onClose}
						>
							<ArrowLeft className="w-4 h-4" />
							GO BACK
						</Button>
						<div className="border-b border-[var(--color-stroke-neutral)] my-4" />
					</div>
				</div>
				{/* Title */}
				<div className="text-left mb-8 ml-8">
					<h1 className="text-[var(--color-neutral-primary)] font-semibold text-2xl mb-2">
						Add new client
					</h1>
					<p className="text-[var(--color-stroke-brand)]">
						Create a client profile to begin assigning GrubPacs and
						managing their setup.
					</p>
				</div>
				{/* Main Form */}
				<div className="w-full flex-1 grid grid-cols-12 overflow-y-auto justify-center">
					<div className="col-span-10 col-start-2 w-full px-8">
						{/* Section 1: Basic details */}
						<h3 className="text-[var(--color-neutral-secondary)] text-base mb-3">
							Basic details
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							<div>
								<Input
									placeholder="Full name"
									value={form.fullName}
									onChange={(e) =>
										handleChange("fullName", e.target.value)
									}
									onFocus={() => handleFocus("fullname")}
									onBlur={handleBlur}
									isFocused={focusedField === "fullname"}
									className="py-3 px-4"
								/>
							</div>
							<div className="relative">
								<Input
									placeholder="Client ID"
									value={form.clientId}
									onChange={(e) =>
										handleChange("clientId", e.target.value)
									}
									onFocus={() => handleFocus("Clientid")}
									onBlur={handleBlur}
									isFocused={focusedField === "Clientid"}
									className="py-3 px-8"
								/>
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)] text-sm pointer-events-none z-10">
									#
								</span>
							</div>
						</div>
						{/* Section 2: Contact details */}
						<h3 className="text-[var(--color-neutral-secondary)] text-base mb-3">
							Contact details
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							<div>
								<MobileNumberInput
									value={form.phone}
									onChange={(val) =>
										handleChange("phone", val)
									}
									placeholder="00000 00000"
									padding="!py-3 !px-4"
								/>
							</div>
							<div>
								<Input
									placeholder="Email address"
									value={form.email}
									onChange={(e) =>
										handleChange("email", e.target.value)
									}
									onFocus={() => handleFocus("emailaddress")}
									onBlur={handleBlur}
									isFocused={focusedField === "emailaddress"}
									className="py-3 px-4"
								/>
							</div>
						</div>
						{/* Section 3: Region */}
						<h3 className="text-[var(--color-neutral-secondary)] text-base mb-3">
							Region
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
							<div>
								<Select
									placeholder="Select country"
									options={countryOptions}
									value={form.country}
									onChange={(val) =>
										handleChange("country", val)
									}
									fontSize="!text-base"
								/>
							</div>
							<div>
								<Select
									placeholder="Select state/province"
									options={stateOptions}
									value={form.state}
									onChange={(val) =>
										handleChange("state", val)
									}
									disabled={!selectedIso}
									fontSize="!text-base"
									className="disabled:pointer-events-none"
								/>
							</div>
						</div>
						{/* Section 4: Vertical */}
						<h3 className="text-[var(--color-neutral-secondary)] text-base mb-3">
							Vertical
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
							<div>
								<Select
									placeholder="Select vertical"
									options={verticalOptions}
									value={form.vertical}
									onChange={(val) =>
										handleChange("vertical", val)
									}
									fontSize="!text-base"
								/>
							</div>
							<div>
								<Input
									placeholder="Organisation name"
									value={form.orgName}
									onChange={(e) =>
										handleChange("orgName", e.target.value)
									}
									onFocus={() =>
										handleFocus("organisationname")
									}
									onBlur={handleBlur}
									isFocused={
										focusedField === "organisationname"
									}
									disabled={isOrganizationDisabled}
									className="py-3 px-4"
								/>
							</div>
						</div>
					</div>
				</div>
				{/* Footer */}
				<div className="flex-shrink-0">
					<div className="px-6">
						<hr className="border-t border-[var(--color-box-border)] w-full my-6" />
						<div className="flex items-center justify-between gap-4 pb-6">
							<Button
								variant="grayOutline"
								onClick={onClose}
								className="px-6 sm:px-28 py-3"
							>
								CANCEL
							</Button>
							<Button
								variant={
									isFormValid ? "primary" : "disabledPrimary"
								}
								disabled={!isFormValid || isCreating}
								onClick={handleSave}
								className="px-6 sm:px-28 py-3 flex items-center gap-2"
							>
								SAVE ROLE
							</Button>
						</div>
					</div>
				</div>
			</div>
		</FullPageModal>
	);
};
export default AddNewClient;
