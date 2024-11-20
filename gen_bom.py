#
# Example python script to generate a BOM from a KiCad generic netlist
#
# Example: Sorted and Grouped CSV BOM
#

"""
    @package
    Output: CSV (comma-separated)
    Grouped By: Value, Footprint, DNP
    Sorted By: Ref
    Fields: Ref, Qnty, Value, Cmp name, Footprint, Description, Vendor, DNP

    Command line:
    python "pathToFile/bom_csv_grouped_by_value_with_fp.py" "%I" "%O.csv"
"""

import sys
sys.path.append('/usr/share/kicad/plugins')

# Import the KiCad python helper module and the csv formatter
import kicad_netlist_reader
import kicad_utils
import csv
import sys
import pathlib
import os

# A helper function to filter/convert a string read in netlist
#currently: do nothing
def fromNetlistText( aText ):
    return aText

# Generate an instance of a generic netlist, and load the netlist tree from
# the command line option. If the file doesn't exist, execution will stop
net = kicad_netlist_reader.netlist(sys.argv[1])

files_open = []
def create_csv_output(group_name = "other"):
    # Open a file to write to, if the file cannot be opened output to stdout
    # instead
    name_without_extension = pathlib.Path(sys.argv[2]).stem
    extension = pathlib.Path(sys.argv[2]).suffix
    output_file = name_without_extension + "_" + group_name + extension
    output_file = os.path.join(pathlib.Path(sys.argv[2]).parent, output_file)
    try:
        f = open(output_file, 'w')
        files_open.append(f)
        print(f)
    except IOError as exc:
        e = "Can't open output file for writing: " + output_file
        print(__file__, ":", e, sys.stderr)
        raise Exception(exc)

    out = csv.writer(f, lineterminator='\n', delimiter=',', quotechar='\"', quoting=csv.QUOTE_ALL)
    return out


groups_to_separate = ["R", "C", "U"]
group_units = {
    "R": "Ω",
    "C": "F",
}

default_group_writer = create_csv_output()
group_writers = {group: create_csv_output(group) for group in groups_to_separate}

# Create a new csv writer object to use as the output formatter

# Output a set of rows for a header providing general information
# out.writerow(['Source:', net.getSource()])
# out.writerow(['Date:', net.getDate()])
# out.writerow(['Tool:', net.getTool()])
# out.writerow( ['Generator:', sys.argv[0]] )
# out.writerow(['Component Count:', len(net.components)])
default_group_writer.writerow(['Ref', 'Qnty', 'Value',  'LCSC', 'DNP'])
for group_writer in group_writers.values():
    group_writer.writerow(['Ref', 'Qnty', 'Value',  'LCSC', 'DNP'])

# Get all of the components in groups of matching parts + values
# (see ky_generic_netlist_reader.py)
grouped = net.groupComponents()

# Output all of the component information
for group in grouped:
    refs = ""

    # Add the reference of every component in the group and keep a reference
    # to the component so that the other data can be filled in once per group
    for component in group:
        if refs != "":
            refs += ", "
        refs += fromNetlistText( component.getRef() )
        c = component

    out = default_group_writer
    val = c.getValue()
    if val.strip() in ["DNP", "TestPoint"] or val.startswith("SolderJumper") or val.startswith("MountingHole"):
            continue
    for group_name, group_writer in group_writers.items():
        # check if component ref starts with group_name, and a number after it
        if refs.startswith(group_name) and refs[len(group_name)].isdigit():
            out = group_writer
            if group_name in group_units:
                val_segments = val.split(" ")
                val_segments[0] = val_segments[0] + group_units[group_name]
                val = " ".join(val_segments)
            break
   
    # Fill in the component groups common data
    out.writerow([refs, len(group),
        fromNetlistText( val ),
        fromNetlistText( c.getField("LCSC") ),
        c.getDNPString()])
    


for f in files_open:
    f.close()
