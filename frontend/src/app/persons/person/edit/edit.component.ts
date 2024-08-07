import { Component, DestroyRef, inject, input, model, OnInit, signal } from '@angular/core';
import { Person } from '../person.model';
import { PersonsService } from '../../persons.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit {

  public editPerson = input.required<Person>();
  public openEditModal = model.required<boolean>();
  public persons = model.required<Person[]>();

  private person!: Person;
  private personsService = inject(PersonsService);
  private destoryRef = inject(DestroyRef);

  public editForm = new FormGroup({
    name: new FormControl('', { validators: [] }),
    lastname: new FormControl('', { validators: [] }),
    profession: new FormControl('', { validators: [] }),
    description: new FormControl('', { validators: [] }),
    imageUrl: new FormControl('', { validators: [] }),
  });

  // set fields for form
  ngOnInit(): void {
    this.editForm.controls.name.setValue(this.editPerson().name);
    this.editForm.controls.lastname.setValue(this.editPerson().lastname);
    this.editForm.controls.profession.setValue(this.editPerson().profession);
    this.editForm.controls.description.setValue(this.editPerson().description);
    this.editForm.controls.imageUrl.setValue(this.editPerson().imageUrl);
  }

  onCloseModal() {
    this.openEditModal.set(false);
  }

  private createNewPerson(): Person {
    return new Person(
      this.editPerson().document_id,
      this.editForm.controls.name.value!,
      this.editForm.controls.lastname.value!,
      this.editForm.controls.profession.value!,
      this.editForm.controls.imageUrl.value!,
      this.editForm.controls.description.value!
    );
  }

  onSubmit() {

    this.person = this.createNewPerson();

    const subscription = this.personsService.editPerson(this.editPerson().document_id, this.person).subscribe({
      next: (value) => {
        console.log(value);

        this.personsService.getPersons().subscribe({
          next: (values) => {
            for (let i = 0; i < values.length; i++)
              if(values[i].document_id === this.person.document_id)
                values[i] = value;
          }
        });
        
      },
      error: (error) => { console.log(error.message); },
      complete: () => {
        console.log('Updated person ' + this.person.document_id);
      }
    });

    this.destoryRef.onDestroy(() => {
      subscription.unsubscribe();
    });

    for(let i=0;i<this.persons().length; i++){
      if(this.persons()[i].document_id === this.editPerson().document_id){
        this.persons()[i] = this.person;
      }
    }

    this.openEditModal.set(false);
  }

}
